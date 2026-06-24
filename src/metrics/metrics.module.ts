import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PricesModule } from '../prices/prices.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { MetricsScheduler } from './metrics.scheduler';

@Module({
  imports: [PrismaModule, AuthModule, PricesModule],
  controllers: [MetricsController],
  providers: [MetricsService, MetricsScheduler],
})
export class MetricsModule {}
