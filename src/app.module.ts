import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { RiskModule } from './risk/risk.module';
import { AuthModule } from './auth/auth.module';
import { TokenController } from './controllers/tokenController';
import { PriceController } from './controllers/priceController';

@Module({
  imports: [HealthModule, RiskModule, AuthModule],
  controllers: [AppController, TokenController, PriceController],
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
    consumer
      .apply(RequireJwtMiddleware)
      .forRoutes(
        { path: 'api/v1/webhook/soroban', method: RequestMethod.POST },
        { path: 'invoices', method: RequestMethod.POST }, // Database-mutating in AppController
      );
  }
}
