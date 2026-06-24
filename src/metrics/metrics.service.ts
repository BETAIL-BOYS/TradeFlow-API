import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { PricesService } from '../prices/prices.service';

export interface TvlMetrics {
  tvlUSD: number;
  poolCount: number;
  lastUpdated: string;
}

export interface RevenueMetrics {
  totalRevenueUSD: number;
  lastUpdated: string;
}

export interface ActiveUsersMetrics {
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
  lastUpdated: string;
}

const CACHE_TTL_SECONDS = 360;
const DEFAULT_FEE_BPS = 30;

/**
 * Service responsible for computing and serving protocol-wide metrics.
 * Heavy aggregation runs on a schedule; API reads from Redis with DB fallback.
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly CACHE_KEY_TVL = 'metrics:global:tvl';
  private readonly CACHE_KEY_REVENUE = 'metrics:protocol:revenue';
  private readonly CACHE_KEY_ACTIVE_USERS = 'metrics:active-users';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly pricesService: PricesService,
  ) {}

  /**
   * Retrieves cached global TVL metrics.
   *
   * @returns TVL metrics including pool count and last update timestamp.
   * @throws ServiceUnavailableException if metrics have never been computed.
   */
  async getTvl(): Promise<TvlMetrics> {
    const cached = await this.getFromRedis<TvlMetrics>(this.CACHE_KEY_TVL);
    if (cached) return cached;

    const snapshot = await this.getLatestSnapshot();
    if (!snapshot) {
      throw new ServiceUnavailableException('Metrics not yet available');
    }

    return {
      tvlUSD: this.decimalToNumber(snapshot.globalTvlUsd),
      poolCount: await this.prisma.pool.count({ where: { isActive: true } }),
      lastUpdated: snapshot.computedAt.toISOString(),
    };
  }

  /**
   * Retrieves cached cumulative protocol revenue metrics.
   *
   * @returns Total protocol revenue routed to treasury in USD.
   * @throws ServiceUnavailableException if metrics have never been computed.
   */
  async getRevenue(): Promise<RevenueMetrics> {
    const cached = await this.getFromRedis<RevenueMetrics>(this.CACHE_KEY_REVENUE);
    if (cached) return cached;

    const snapshot = await this.getLatestSnapshot();
    if (!snapshot) {
      throw new ServiceUnavailableException('Metrics not yet available');
    }

    return {
      totalRevenueUSD: this.decimalToNumber(snapshot.totalRevenueUsd),
      lastUpdated: snapshot.computedAt.toISOString(),
    };
  }

  /**
   * Retrieves cached active unique trader counts for 24h, 7d, and 30d windows.
   *
   * @returns Active user counts per time window.
   * @throws ServiceUnavailableException if metrics have never been computed.
   */
  async getActiveUsers(): Promise<ActiveUsersMetrics> {
    const cached = await this.getFromRedis<ActiveUsersMetrics>(this.CACHE_KEY_ACTIVE_USERS);
    if (cached) return cached;

    const snapshot = await this.getLatestSnapshot();
    if (!snapshot) {
      throw new ServiceUnavailableException('Metrics not yet available');
    }

    return {
      activeUsers24h: snapshot.activeUsers24h,
      activeUsers7d: snapshot.activeUsers7d,
      activeUsers30d: snapshot.activeUsers30d,
      lastUpdated: snapshot.computedAt.toISOString(),
    };
  }

  /**
   * Computes all macro metrics, persists a snapshot, and writes to Redis cache.
   * Called by MetricsScheduler every 5 minutes.
   */
  async computeAndCache(): Promise<void> {
    const start = Date.now();
    this.logger.log('Starting metrics aggregation...');

    try {
      const priceMap = await this.buildPriceMap();
      const tokenMap = await this.buildTokenMap();

      const activePools = await this.prisma.pool.findMany({
        where: { isActive: true },
      });

      let globalTvlUsd = 0;

      for (const pool of activePools) {
        const poolTvl = this.calculatePoolTvlUsd(pool, tokenMap, priceMap);
        globalTvlUsd += poolTvl;

        await this.prisma.pool.update({
          where: { id: pool.id },
          data: { tvlUsd: poolTvl },
        });
      }

      const totalRevenueUsd = await this.calculateTotalRevenueUsd(priceMap, tokenMap);

      const [activeUsers24h, activeUsers7d, activeUsers30d] = await Promise.all([
        this.countActiveUsers(24),
        this.countActiveUsers(24 * 7),
        this.countActiveUsers(24 * 30),
      ]);

      const computedAt = new Date();
      const lastUpdated = computedAt.toISOString();

      const snapshot = await this.prisma.protocolMetricsSnapshot.create({
        data: {
          globalTvlUsd,
          totalRevenueUsd,
          activeUsers24h,
          activeUsers7d,
          activeUsers30d,
          computedAt,
        },
      });

      const tvlMetrics: TvlMetrics = {
        tvlUSD: globalTvlUsd,
        poolCount: activePools.length,
        lastUpdated,
      };

      const revenueMetrics: RevenueMetrics = {
        totalRevenueUSD: totalRevenueUsd,
        lastUpdated,
      };

      const activeUsersMetrics: ActiveUsersMetrics = {
        activeUsers24h,
        activeUsers7d,
        activeUsers30d,
        lastUpdated,
      };

      await Promise.all([
        this.setInRedis(this.CACHE_KEY_TVL, tvlMetrics),
        this.setInRedis(this.CACHE_KEY_REVENUE, revenueMetrics),
        this.setInRedis(this.CACHE_KEY_ACTIVE_USERS, activeUsersMetrics),
      ]);

      this.logger.log(
        `Metrics aggregation completed in ${Date.now() - start}ms (snapshot: ${snapshot.id})`,
      );
    } catch (error) {
      this.logger.error('Metrics aggregation failed', error.message);
    }
  }

  /**
   * Calculates USD TVL for a single pool from reserves and token prices.
   */
  private calculatePoolTvlUsd(
    pool: {
      reserveA: string | null;
      reserveB: string | null;
      tokenA: string;
      tokenB: string;
    },
    tokenMap: Map<string, { symbol: string; decimals: number }>,
    priceMap: Map<string, number>,
  ): number {
    if (!pool.reserveA || !pool.reserveB) {
      return 0;
    }

    const tokenA = tokenMap.get(pool.tokenA.toLowerCase());
    const tokenB = tokenMap.get(pool.tokenB.toLowerCase());

    const reserveAUsd = this.amountToUsd(
      pool.reserveA,
      tokenA?.decimals ?? 7,
      priceMap.get(tokenA?.symbol ?? '') ?? 0,
    );

    const reserveBUsd = this.amountToUsd(
      pool.reserveB,
      tokenB?.decimals ?? 7,
      priceMap.get(tokenB?.symbol ?? '') ?? 0,
    );

    return reserveAUsd + reserveBUsd;
  }

  /**
   * Sums protocol fees across all trades using pool fee tiers.
   */
  private async calculateTotalRevenueUsd(
    priceMap: Map<string, number>,
    tokenMap: Map<string, { symbol: string; decimals: number }>,
  ): Promise<number> {
    const trades = await this.prisma.trade.findMany({
      include: { pool: true },
    });

    let total = 0;

    for (const trade of trades) {
      const feeBps = this.parseFeeBps(trade.pool.fee);
      const amountIn = parseFloat(trade.amountIn) || 0;
      const feeAmount = amountIn * (feeBps / 10_000);

      const tokenA = tokenMap.get(trade.pool.tokenA.toLowerCase());
      const symbol = tokenA?.symbol ?? 'XLM';
      const decimals = tokenA?.decimals ?? 7;
      const price = priceMap.get(symbol) ?? 0;

      total += (feeAmount / Math.pow(10, decimals)) * price;
    }

    return total;
  }

  /**
   * Counts distinct active traders within a rolling hour window.
   */
  private async countActiveUsers(hours: number): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT "userAddress") as count
      FROM trades
      WHERE timestamp >= ${since}
        AND "userAddress" != 'Unknown'
    `;

    return Number(result[0]?.count ?? 0);
  }

  private parseFeeBps(fee: string): number {
    const parsed = parseInt(fee, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FEE_BPS;
  }

  private amountToUsd(rawAmount: string, decimals: number, price: number): number {
    const amount = parseFloat(rawAmount) || 0;
    return (amount / Math.pow(10, decimals)) * price;
  }

  private async buildPriceMap(): Promise<Map<string, number>> {
    const { data } = await this.pricesService.getPrices();
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.symbol, item.price);
    }
    return map;
  }

  private async buildTokenMap(): Promise<Map<string, { symbol: string; decimals: number }>> {
    const tokens = await this.prisma.token.findMany();
    const map = new Map<string, { symbol: string; decimals: number }>();
    for (const token of tokens) {
      map.set(token.address.toLowerCase(), {
        symbol: token.symbol,
        decimals: token.decimals,
      });
    }
    return map;
  }

  private async getLatestSnapshot() {
    return this.prisma.protocolMetricsSnapshot.findFirst({
      orderBy: { computedAt: 'desc' },
    });
  }

  private decimalToNumber(value: { toString(): string }): number {
    return parseFloat(value.toString());
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.redisPublisher.get(key);
      if (cached) return JSON.parse(cached) as T;
    } catch (err) {
      this.logger.warn(`Redis read failed for ${key}`);
    }
    return null;
  }

  private async setInRedis(key: string, data: unknown): Promise<void> {
    await this.redis.redisPublisher.set(
      key,
      JSON.stringify(data),
      'EX',
      CACHE_TTL_SECONDS,
    );
  }
}
