import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { databaseProviders } from '../database.providers';

@Module({
  controllers: [HealthController],
  providers: [...databaseProviders],
})
export class HealthModule {}
