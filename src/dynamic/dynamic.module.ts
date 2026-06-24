import { Module } from '@nestjs/common';
import { NetworkController } from './dynamic.controller';
import { PdfService } from './dynamic.serivice';

@Module({
  controllers: [NetworkController],
  providers: [PdfService],
  exports: [PdfService],
})
export class InvoicesModule {}
