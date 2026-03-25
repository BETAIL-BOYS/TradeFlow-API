import { Module } from '@nestjs/common';
import { OgController } from './og.controller';
import { OgService } from './og.service';

@Module({
  controllers: [OgController],
  providers: [OgService],
})
export class OgModule {}
