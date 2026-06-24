import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IndexerRetryJob } from './queue.service';
import { Server } from '@stellar/stellar-sdk/rpc';

@Processor('indexer-retry')
export class IndexerProcessor extends WorkerHost {
  private readonly logger = new Logger(IndexerProcessor.name);

  async process(job: Job<IndexerRetryJob>): Promise<any> {
    const { rpcMethod, params } = job.data;
    this.logger.log('Processing indexer retry: ' + rpcMethod + ' (attempt ' + job.attemptsMade + ')');

    const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
    const server = new Server(rpcUrl);

    try {
      const result = await (server as any)[rpcMethod](...(Array.isArray(params) ? params : [params]));
      this.logger.log('Indexer retry succeeded: ' + rpcMethod);
      return result;
    } catch (err) {
      this.logger.error('Indexer retry failed: ' + rpcMethod, err);
      throw err;
    }
  }
}
