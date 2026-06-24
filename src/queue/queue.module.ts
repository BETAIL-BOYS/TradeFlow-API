import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { IndexerProcessor } from './indexer.processor';
import { NotificationProcessor } from './notification.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'indexer-retry' },
      { name: 'notification' },
    ),
  ],
  providers: [QueueService, IndexerProcessor, NotificationProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
