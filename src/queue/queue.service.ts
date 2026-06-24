import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface IndexerRetryJob {
  rpcMethod: string;
  params: Record<string, any>;
  attempt: number;
}

export interface NotificationJob {
  type: 'email' | 'webhook';
  recipient: string;
  subject: string;
  payload: Record<string, any>;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('indexer-retry') private indexerQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  async enqueueIndexerRetry(job: IndexerRetryJob) {
    const id = indexer-retry-;
    await this.indexerQueue.add('retry-rpc', job, { jobId: id });
    this.logger.log('Enqueued indexer retry job: ' + id);
    return { jobId: id, status: 'accepted' };
  }

  async enqueueNotification(job: NotificationJob) {
    const id = 
otification-;
    await this.notificationQueue.add('send-notification', job, { jobId: id });
    this.logger.log('Enqueued notification job: ' + id);
    return { jobId: id, status: 'accepted' };
  }
}
