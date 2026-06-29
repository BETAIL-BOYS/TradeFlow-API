import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import * as StellarSdk from '@stellar/stellar-sdk';

export interface FeeTiers {
  low: string;
  medium: string;
  high: string;
  updatedAt: number;
}

@Injectable()
export class GasService {
  private readonly logger = new Logger(GasService.name);
  private readonly CACHE_KEY = 'gas:fee-tiers';
  private readonly POLL_INTERVAL_MS = 5000;
  private readonly FALLBACK: FeeTiers = {
    low: '100',
    medium: '1000',
    high: '10000',
    updatedAt: 0,
  };

  constructor(private readonly redis: RedisService) {
    this.startPolling();
  }

  private startPolling() {
    this.fetchAndCache();
    setInterval(() => this.fetchAndCache(), this.POLL_INTERVAL_MS);
  }

  private async fetchAndCache() {
    try {
      const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
      const server = new StellarSdk.SorobanRpc.Server(rpcUrl);
      const feeStats = await (server as any).getFeeStats();

      const tiers: FeeTiers = {
        low: feeStats.sorobanInclusionFee.p10,
        medium: feeStats.sorobanInclusionFee.p50,
        high: feeStats.sorobanInclusionFee.p90,
        updatedAt: Date.now(),
      };

      await this.redis.redisPublisher.set(this.CACHE_KEY, JSON.stringify(tiers));
      this.logger.debug('Fee tiers cached');
    } catch (err) {
      this.logger.warn('Failed to fetch fee stats, using fallback');
    }
  }

  async getFeeTiers(): Promise<FeeTiers> {
    try {
      const cached = await this.redis.redisPublisher.get(this.CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      this.logger.warn('Redis unavailable, using fallback');
    }
    return this.FALLBACK;
  }
}
