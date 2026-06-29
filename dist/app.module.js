"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const documents_controller_1 = require("./controllers/documents.controller");
const app_service_1 = require("./app.service");
const health_module_1 = require("./health/health.module");
const risk_module_1 = require("./risk/risk.module");
const auth_module_1 = require("./auth/auth.module");
const analytics_module_1 = require("./analytics/analytics.module");
const swap_module_1 = require("./swap/swap.module");
const prisma_module_1 = require("./prisma/prisma.module");
const tokens_module_1 = require("./tokens/tokens.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const og_module_1 = require("./og/og.module");
const trade_module_1 = require("./trade/trade.module");
const orders_module_1 = require("./orders/orders.module");
const gas_module_1 = require("./gas/gas.module");
const config_1 = require("@nestjs/config");
const maintenance_middleware_1 = require("./common/middleware/maintenance.middleware");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
const redis_module_1 = require("./common/redis/redis.module");
const nestjs_pino_1 = require("nestjs-pino");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(request_id_middleware_1.RequestIdMiddleware, maintenance_middleware_1.MaintenanceMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    formatters: {
                        level: (label) => ({ level: label }),
                    },
                    timestamp: () => `,"time":"${new Date().toISOString()}"`,
                    customProps: (req) => ({
                        reqId: req.headers['x-request-id'] || req.id,
                    }),
                    serializers: {
                        req: (req) => ({ method: req.method, url: req.url }),
                        res: (res) => ({ statusCode: res.statusCode }),
                    },
                },
            }),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            redis_module_1.RedisModule,
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            risk_module_1.RiskModule,
            auth_module_1.AuthModule,
            analytics_module_1.AnalyticsModule,
            swap_module_1.SwapModule,
            tokens_module_1.TokensModule,
            og_module_1.OgModule,
            trade_module_1.TradeModule,
            orders_module_1.OrdersModule,
            gas_module_1.GasModule,
        ],
        controllers: [app_controller_1.AppController, documents_controller_1.DocumentsController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map