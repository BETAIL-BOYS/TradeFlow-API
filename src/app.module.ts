import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { DocumentsController } from './controllers/documents.controller';
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
import { TradeModule } from './trade/trade.module';
import { OrdersModule } from './orders/orders.module';
import { GasModule } from './gas/gas.module';
import { ConfigModule } from '@nestjs/config';
import { MaintenanceMiddleware } from './common/middleware/maintenance.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RedisModule } from './common/redis/redis.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // Enforce a flat format optimal for CloudWatch/ELK ingestion
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        // Automatically pluck the correlation ID tracked by your RequestIdMiddleware
        customProps: (req: any) => ({
  reqId: req.headers['x-request-id'] || req.id,
}),
        // Format HTTP access log outputs compactly
        serializers: {
          req: (req) => ({ method: req.method, url: req.url }),
          res: (res) => ({ statusCode: res.statusCode }),
        },
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    PrismaModule, 
    HealthModule, 
    RiskModule, 
    AuthModule, 
    AnalyticsModule, 
    SwapModule, 
    TokensModule, 
    OgModule,
    TradeModule,
    OrdersModule,
    GasModule,
  ],
  controllers: [AppController, DocumentsController],
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
      .apply(RequestIdMiddleware, MaintenanceMiddleware)
      .forRoutes('*');
  }
}
