import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { PricesService } from '../prices/prices.service';

/**
 * Unit tests for the MetricsService.
 * Verifies aggregation logic, cache reads, and acceptance criteria behavior.
 */
describe('MetricsService', () => {
  let service: MetricsService;

  const mockRedisPublisher = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockPrisma = {
    pool: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    trade: {
      findMany: jest.fn(),
    },
    token: {
      findMany: jest.fn(),
    },
    protocolMetricsSnapshot: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockPricesService = {
    getPrices: jest.fn().mockResolvedValue({
      data: [
        { symbol: 'USDC', price: 1.0 },
        { symbol: 'XLM', price: 0.12 },
      ],
      cached: false,
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: RedisService,
          useValue: { redisPublisher: mockRedisPublisher },
        },
        { provide: PricesService, useValue: mockPricesService },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  /**
   * Basic sanity check to ensure the service is correctly instantiated.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Returns TVL from Redis cache when available.
   */
  it('should return TVL metrics from Redis cache (Acceptance Criteria)', async () => {
    const cached = {
      tvlUSD: 5000000,
      poolCount: 3,
      lastUpdated: '2026-06-24T12:00:00.000Z',
    };
    mockRedisPublisher.get.mockResolvedValue(JSON.stringify(cached));

    const result = await service.getTvl();

    expect(result).toEqual(cached);
    expect(mockPrisma.protocolMetricsSnapshot.findFirst).not.toHaveBeenCalled();
  });

  /**
   * Throws when metrics have never been computed and Redis is empty.
   */
  it('should throw ServiceUnavailableException when no metrics exist', async () => {
    mockRedisPublisher.get.mockResolvedValue(null);
    mockPrisma.protocolMetricsSnapshot.findFirst.mockResolvedValue(null);

    await expect(service.getTvl()).rejects.toThrow(ServiceUnavailableException);
  });

  /**
   * Aggregates global TVL from active pools with reserves and caches results.
   */
  it('should compute and cache global TVL from active pools', async () => {
    mockPrisma.pool.findMany.mockResolvedValue([
      {
        id: 'pool-1',
        reserveA: '1000000000',
        reserveB: '500000000',
        tokenA: 'usdc-addr',
        tokenB: 'xlm-addr',
        fee: '30',
        isActive: true,
      },
    ]);
    mockPrisma.pool.update.mockResolvedValue({});
    mockPrisma.token.findMany.mockResolvedValue([
      { address: 'usdc-addr', symbol: 'USDC', decimals: 7 },
      { address: 'xlm-addr', symbol: 'XLM', decimals: 7 },
    ]);
    mockPrisma.trade.findMany.mockResolvedValue([]);
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(10) }])
      .mockResolvedValueOnce([{ count: BigInt(50) }])
      .mockResolvedValueOnce([{ count: BigInt(200) }]);
    mockPrisma.protocolMetricsSnapshot.create.mockResolvedValue({ id: 'snap-1' });

    await service.computeAndCache();

    expect(mockPrisma.protocolMetricsSnapshot.create).toHaveBeenCalled();
    expect(mockRedisPublisher.set).toHaveBeenCalledWith(
      'metrics:global:tvl',
      expect.any(String),
      'EX',
      360,
    );
  });

  /**
   * Falls back to latest DB snapshot for revenue when Redis is cold.
   */
  it('should fall back to DB snapshot for revenue metrics', async () => {
    mockRedisPublisher.get.mockResolvedValue(null);
    mockPrisma.protocolMetricsSnapshot.findFirst.mockResolvedValue({
      totalRevenueUsd: { toString: () => '12500.50' },
      computedAt: new Date('2026-06-24T12:00:00.000Z'),
    });

    const result = await service.getRevenue();

    expect(result.totalRevenueUSD).toBe(12500.5);
    expect(result.lastUpdated).toBe('2026-06-24T12:00:00.000Z');
  });
});
