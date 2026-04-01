import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { RiskModule } from './risk/risk.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SwapModule } from './swap/swap.module';
import { PrismaModule } from './prisma/prisma.module';
import { TokensModule } from './tokens/tokens.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { OgModule } from './og/og.module';
import { RequireJwtMiddleware } from './common/middleware/require-jwt.middleware';
import { ConfigModule } from './config/config.module';
import { PoolsModule } from './pools/pools.module';
import { WebhookBodyMiddleware } from './auth/middleware/webhook-body.middleware';

@Module({
  imports: [PrismaModule, HealthModule, RiskModule, AuthModule, AnalyticsModule, SwapModule, TokensModule, OgModule, ConfigModule, PoolsModule, PricesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply webhook body middleware FIRST to capture raw body before JSON parsing
    consumer
      .apply(WebhookBodyMiddleware)
      .forRoutes(
        { path: 'api/v1/webhook/soroban', method: RequestMethod.POST },
      );

    // Then apply JWT middleware for authentication
    consumer
      .apply(RequireJwtMiddleware)
      .forRoutes(
        { path: 'api/v1/webhook/soroban', method: RequestMethod.POST },
        { path: 'invoices', method: RequestMethod.POST }, // Database-mutating in AppController
      );
  }
}
