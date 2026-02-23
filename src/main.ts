import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configure CORS for secure cross-origin communication
  app.enableCors({
    origin: [
      'http://localhost:3000', // Local development environment
      'https://tradeflow-web.vercel.app', // Production environment
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('TradeFlow API')
    .setDescription('API documentation for the TradeFlow application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
