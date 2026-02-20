import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { RiskModule } from './risk/risk.module';

@Module({
  imports: [HealthModule, RiskModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
