import { Module } from '@nestjs/common';
import { InvoicesController } from '../invoices/invoices.controller';
import { PdfService } from '../invoices/pdf.service';

@Module({
  controllers: [InvoicesController],
  providers: [PdfService],
})
export class InvoicesModule {}
