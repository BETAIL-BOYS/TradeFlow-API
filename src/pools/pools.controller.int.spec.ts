import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PoolsModule } from './pools.module';

describe('PoolsController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PoolsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/pools/:poolId/apy-history returns 200 and a 7-point history array', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/pools/pool-123/apy-history')
      .expect(200);

    // The endpoint returns the APY history array directly (see the controller's
    // `ApyHistoryPoint[]` return type / Swagger `isArray: true`); this app has no
    // global response-envelope interceptor.
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(7);

    for (const item of res.body) {
      expect(item).toHaveProperty('date');
      expect(item).toHaveProperty('apyPercentage');
      expect(typeof item.date).toBe('string');
      expect(typeof item.apyPercentage).toBe('number');
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

