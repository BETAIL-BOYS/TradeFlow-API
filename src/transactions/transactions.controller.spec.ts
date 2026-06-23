import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Keypair, Networks } from '@stellar/stellar-sdk';
import * as request from 'supertest';
import { TransactionsModule } from './transactions.module';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let app: INestApplication;
  const source = Keypair.random().publicKey();
  const destination = Keypair.random().publicKey();

  const transactionsService = {
    buildTransaction: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TransactionsModule],
    })
      .overrideProvider(TransactionsService)
      .useValue(transactionsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    transactionsService.buildTransaction.mockResolvedValue({
      xdr: 'AAAA',
      source,
      operationCount: 1,
      networkPassphrase: Networks.TESTNET,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/transactions/build delegates to the transaction builder service', async () => {
    const payload = {
      source,
      operations: [
        {
          type: 'payment',
          destination,
          asset: { type: 'native' },
          amount: '1.0000000',
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/transactions/build')
      .send(payload)
      .expect(200);

    expect(transactionsService.buildTransaction).toHaveBeenCalledWith(payload);
    expect(response.body).toEqual({
      xdr: 'AAAA',
      source,
      operationCount: 1,
      networkPassphrase: Networks.TESTNET,
    });
  });
});
