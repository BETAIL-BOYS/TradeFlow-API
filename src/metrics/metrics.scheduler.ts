import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { MetricsService } from './metrics.service';

/**
 * Schedules periodic recomputation of protocol macro metrics.
 * Runs every 5 minutes, matching the existing IndexerJob cron interval.
 */
@Injectable()
export class MetricsScheduler implements OnModuleInit {
  private readonly logger = new Logger(MetricsScheduler.name);

  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Registers the cron job and runs an initial computation on startup.
   */
  onModuleInit() {
    cron.schedule('*/5 * * * *', () => {
      this.metricsService.computeAndCache();
    });

    this.logger.log('Metrics scheduler initialized (every 5 minutes)');

    // Warm cache on startup
    this.metricsService.computeAndCache();
  }
}
