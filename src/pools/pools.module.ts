import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';

@Module({
  controllers: [PoolsController],
})
export class PoolsModule {}

