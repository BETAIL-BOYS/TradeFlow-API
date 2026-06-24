import { Module } from '@nestjs/common';
import { NetworkController } from './dynamic.controller';

@Module({
  controllers: [NetworkController],
})
export class DynamicModule {}
