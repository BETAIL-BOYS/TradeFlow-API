import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Standalone config must use require
const redis = require('../config/redis');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security: Disable X-Powered-By header to hide Express.js stack
  app.disable('x-powered-by');
  
  // Global Rate Limiting (Redis-backed for horizontal scaling)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
      }),
      message: 'Too many requests from this IP, please try again after 15 minutes',
    }),
  );
  
  // Strict Rate Limiter for Webhook Endpoint (DDoS protection)
  const webhookLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // Limit each IP to 50 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    message: 'Too many webhook requests from this IP, please try again after 1 minute',
  });
  
  // Apply strict webhook limiter to the Stellar webhook route
  app.use('/api/v1/webhooks/stellar', webhookLimiter);

  // Enable CORS
  app.enableCors({
    origin: true,
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

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}

bootstrap();