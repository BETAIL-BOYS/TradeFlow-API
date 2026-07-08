import { Account, Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk';
import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const source = Keypair.random().publicKey();
  const firstDestination = Keypair.random().publicKey();
  const secondDestination = Keypair.random().publicKey();
  const issuer = Keypair.random().publicKey();

  const accountLoader = {
    loadAccount: jest.fn(),
  };

  beforeEach(() => {
    accountLoader.loadAccount.mockResolvedValue(new Account(source, '123'));
  });

  it('builds an unsigned XDR envelope from sequential swap intents', async () => {
    const service = new TransactionsService(accountLoader);

    const result = await service.buildTransaction({
      source,
      fee: '200',
      networkPassphrase: Networks.TESTNET,
      operations: [
        {
          type: 'pathPaymentStrictSend',
          sendAsset: { type: 'native' },
          sendAmount: '10.0000000',
          destination: firstDestination,
          destAsset: { type: 'credit_alphanum4', code: 'USDC', issuer },
          destMin: '9.5000000',
          path: [{ type: 'credit_alphanum4', code: 'EURC', issuer }],
        },
        {
          type: 'payment',
          destination: secondDestination,
          asset: { type: 'native' },
          amount: '1.0000000',
        },
      ],
    });

    expect(accountLoader.loadAccount).toHaveBeenCalledWith(source);
    expect(result.source).toBe(source);
    expect(result.operationCount).toBe(2);
    expect(typeof result.xdr).toBe('string');

    const transaction = TransactionBuilder.fromXDR(result.xdr, Networks.TESTNET) as any;
    expect(transaction.operations).toHaveLength(2);
    expect(transaction.operations[0].type).toBe('pathPaymentStrictSend');
    expect(transaction.operations[1].type).toBe('payment');
  });

  it('rejects empty operation arrays', async () => {
    const service = new TransactionsService(accountLoader);

    await expect(
      service.buildTransaction({
        source,
        operations: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
