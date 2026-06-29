import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { IndexerJob } from './jobs/indexer';
import rateLimit from 'express-rate-limit';
import { Logger } from 'nestjs-pino';
import RedisStore from 'rate-limit-redis';
import * as compression from 'compression';

// Redis is optional - gracefully fall back to in-memory limiting if unavailable
let redis: any = null;
try {
  redis = require('../config/redis');
} catch {
  // Redis not configured; rate-limiting will use in-memory store
}

/**
 * Entry point for the NestJS application.
 * Configures the app with global middleware, security headers, compression, and Swagger documentation.
 */
async function bootstrap() {
  // Monkey-patch console.error to swallow the specific unmanaged Redis noise
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Redis Connection Error')) {
      return; // Silently discard the noise
    }
    originalConsoleError(...args);
  };

  const app = await NestFactory.create(AppModule, {
    // Buffer logs until Pino is attached
    bufferLogs: true,
  });

  // Bind Pino as the unified framework logger instance
  app.useLogger(app.get(Logger));

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

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');

  // Initialize background jobs
  new IndexerJob();
}

bootstrap();
