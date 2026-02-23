import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { RiskModule } from './risk/risk.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [HealthModule, RiskModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
