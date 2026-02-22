import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { corsConfig } from './cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsConfig);
  await app.listen(3000);
}
bootstrap();
