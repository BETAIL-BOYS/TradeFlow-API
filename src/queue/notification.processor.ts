import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationJob } from './queue.service';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationJob>): Promise<any> {
    const { type, recipient, subject, payload } = job.data;
    this.logger.log('Processing notification: ' + type + ' to ' + recipient + ' (attempt ' + job.attemptsMade + ')');

    if (type === 'webhook') {
      try {
        await fetch(recipient, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, ...payload }),
        });
        this.logger.log('Webhook sent successfully');
      } catch (err) {
        this.logger.error('Webhook failed', err);
        throw err;
      }
    }

    if (type === 'email') {
      this.logger.log('Email notification queued for: ' + recipient);
    }

    return { status: 'processed' };
  }
}
