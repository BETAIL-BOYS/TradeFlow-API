import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { IndexerJob } from './jobs/indexer';
import { CustomLogger } from './common/logger/custom.logger';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import compression from 'compression';

// Redis is optional - gracefully fall back to in-memory limiting if unavailable
let redis: any = null;
try {
  redis = require('../config/redis');
} catch {
  // Redis not configured; rate-limiting will use in-memory store
}

function getLogLevels(nodeEnv: string): LogLevel[] {
  switch (nodeEnv) {
    case 'production':
      return ['error', 'warn', 'log'];
    case 'test':
      return ['error'];
    case 'development':
    default:
      return ['error', 'warn', 'log', 'debug', 'verbose'];
  }
}

/**
 * Entry point for the NestJS application.
 * Configures the app with global middleware, security headers, compression, and Swagger documentation.
 */
async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger('App', {
      logLevels: getLogLevels(nodeEnv),
    }),
  });

  // Security: Disable X-Powered-By header to hide Express.js stack
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Gzip compression for all responses
  app.use(compression());

  // Global Rate Limiting (Redis-backed when available, in-memory fallback)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      ...(redis
        ? {
            store: new RedisStore({
              sendCommand: (...args: string[]) => redis.call(...args),
            }),
          }
        : {}),
      message: 'Too many requests from this IP, please try again after 15 minutes',
    }),
  );

  // Strict Rate Limiter for Webhook Endpoint (DDoS protection)
  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    ...(redis
      ? {
          store: new RedisStore({
            sendCommand: (...args: string[]) => redis.call(...args),
          }),
        }
      : {}),
    message: 'Too many webhook requests from this IP, please try again after 1 minute',
  });

  // Apply strict webhook limiter to the Stellar webhook route
  app.use('/api/v1/webhooks/stellar', webhookLimiter);

  // Environment Variable Validation (failsafe boot sequence)
  const requiredEnvVars = ['PORT', 'NODE_ENV', 'ADMIN_API_KEY', 'WEBHOOK_SECRET'];
  const missingVars = requiredEnvVars.filter(key => !process.env[key]);

  if (missingVars.length > 0) {
    missingVars.forEach(key => {
      console.error(`CRITICAL: Missing required environment variable: ${key}`);
    });
    console.error('Server cannot start due to missing configuration. Please check your .env file.');
    process.exit(1);
  }

  // Enable CORS with strict origin whitelist
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'https://localhost:3000']; // Default for development

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TradeFlow API')
    .setDescription('TradeFlow API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${nodeEnv} | Log levels: ${getLogLevels(nodeEnv).join(', ')}`);

  // Initialize background jobs
  new IndexerJob();
}

bootstrap();
