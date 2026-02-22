import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { RiskModule } from './risk/risk.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [HealthModule, RiskModule, InvoicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
