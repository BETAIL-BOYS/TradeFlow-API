import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Account,
  Asset,
  BASE_FEE,
  Horizon,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

type BuildAssetDto =
  | { type: 'native' }
  | { type: 'credit_alphanum4' | 'credit_alphanum12'; code: string; issuer: string };

type PaymentIntentDto = {
  type: 'payment';
  destination: string;
  asset: BuildAssetDto;
  amount: string;
};

type PathPaymentStrictSendIntentDto = {
  type: 'pathPaymentStrictSend';
  sendAsset: BuildAssetDto;
  sendAmount: string;
  destination: string;
  destAsset: BuildAssetDto;
  destMin: string;
  path?: BuildAssetDto[];
};

export type BuildTransactionDto = {
  source: string;
  operations: Array<PaymentIntentDto | PathPaymentStrictSendIntentDto>;
  fee?: string;
  networkPassphrase?: string;
  timeoutSeconds?: number;
};

export type BuildTransactionResult = {
  xdr: string;
  source: string;
  operationCount: number;
  networkPassphrase: string;
};

export interface StellarAccountLoader {
  loadAccount(source: string): Promise<Account>;
}

class HorizonAccountLoader implements StellarAccountLoader {
  private readonly server: Horizon.Server;

  constructor(horizonUrl = process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org') {
    this.server = new Horizon.Server(horizonUrl);
  }

  async loadAccount(source: string): Promise<Account> {
    return this.server.loadAccount(source);
  }
}

@Injectable()
export class TransactionsService {
  constructor(private readonly accountLoader: StellarAccountLoader = new HorizonAccountLoader()) {}

  async buildTransaction(body: BuildTransactionDto): Promise<BuildTransactionResult> {
    this.validateSource(body?.source);

    if (!Array.isArray(body.operations) || body.operations.length === 0) {
      throw new BadRequestException('operations must contain at least one item');
    }

    if (body.operations.length > 20) {
      throw new BadRequestException('operations cannot contain more than 20 items');
    }

    const sourceAccount = await this.accountLoader.loadAccount(body.source);
    const networkPassphrase = body.networkPassphrase ?? Networks.TESTNET;
    const fee = this.normalizeFee(body.fee);

    const builder = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase,
    });

    for (const intent of body.operations) {
      builder.addOperation(this.toOperation(intent));
    }

    builder.setTimeout(this.normalizeTimeout(body.timeoutSeconds));

    return {
      xdr: builder.build().toXDR(),
      source: body.source,
      operationCount: body.operations.length,
      networkPassphrase,
    };
  }

  private toOperation(intent: PaymentIntentDto | PathPaymentStrictSendIntentDto) {
    if (!intent || typeof intent !== 'object') {
      throw new BadRequestException('operation must be an object');
    }

    switch (intent.type) {
      case 'payment':
        this.validateDestination(intent.destination);
        this.validateAmount(intent.amount, 'amount');
        return Operation.payment({
          destination: intent.destination,
          asset: this.toAsset(intent.asset),
          amount: intent.amount,
        });

      case 'pathPaymentStrictSend':
        this.validateDestination(intent.destination);
        this.validateAmount(intent.sendAmount, 'sendAmount');
        this.validateAmount(intent.destMin, 'destMin');
        return Operation.pathPaymentStrictSend({
          sendAsset: this.toAsset(intent.sendAsset),
          sendAmount: intent.sendAmount,
          destination: intent.destination,
          destAsset: this.toAsset(intent.destAsset),
          destMin: intent.destMin,
          path: (intent.path ?? []).map((asset) => this.toAsset(asset)),
        });

      default:
        throw new BadRequestException(`unsupported operation type: ${(intent as any).type}`);
    }
  }

  private toAsset(asset: BuildAssetDto): Asset {
    if (!asset || typeof asset !== 'object') {
      throw new BadRequestException('asset must be an object');
    }

    if (asset.type === 'native') {
      return Asset.native();
    }

    if (asset.type !== 'credit_alphanum4' && asset.type !== 'credit_alphanum12') {
      throw new BadRequestException(`unsupported asset type: ${(asset as any).type}`);
    }

    const code = String(asset.code ?? '').trim();
    if (!/^[A-Z0-9]{1,12}$/.test(code)) {
      throw new BadRequestException('asset code must be 1-12 uppercase alphanumeric characters');
    }

    if (asset.type === 'credit_alphanum4' && code.length > 4) {
      throw new BadRequestException('credit_alphanum4 asset codes cannot exceed 4 characters');
    }

    this.validateIssuer(asset.issuer);
    return new Asset(code, asset.issuer);
  }

  private normalizeFee(fee?: string): string {
    if (fee === undefined) {
      return String(BASE_FEE);
    }

    if (!/^\d+$/.test(String(fee))) {
      throw new BadRequestException('fee must be a positive integer string');
    }

    const parsedFee = Number(fee);
    if (!Number.isSafeInteger(parsedFee) || parsedFee < Number(BASE_FEE)) {
      throw new BadRequestException(`fee must be at least ${BASE_FEE}`);
    }

    return String(parsedFee);
  }

  private normalizeTimeout(timeoutSeconds?: number): number {
    if (timeoutSeconds === undefined) {
      return 300;
    }

    if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 0 || timeoutSeconds > 3600) {
      throw new BadRequestException('timeoutSeconds must be an integer between 0 and 3600');
    }

    return timeoutSeconds;
  }

  private validateAmount(amount: string, field: string): void {
    if (!/^\d+(\.\d{1,7})?$/.test(String(amount))) {
      throw new BadRequestException(`${field} must be a positive Stellar amount string`);
    }

    if (Number(amount) <= 0) {
      throw new BadRequestException(`${field} must be greater than zero`);
    }
  }

  private validateSource(source: string): void {
    if (!StrKey.isValidEd25519PublicKey(source)) {
      throw new BadRequestException('source must be a valid Stellar public key');
    }
  }

  private validateDestination(destination: string): void {
    if (!StrKey.isValidEd25519PublicKey(destination)) {
      throw new BadRequestException('destination must be a valid Stellar public key');
    }
  }

  private validateIssuer(issuer: string): void {
    if (!StrKey.isValidEd25519PublicKey(issuer)) {
      throw new BadRequestException('asset issuer must be a valid Stellar public key');
    }
  }
}
