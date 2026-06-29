import { Module } from '@nestjs/common';
// Comment these out temporarily:
// import { InvoicesController } from './invoices.controller';
// import { PdfService } from './pdf.service';

@Module({
  controllers: [/* InvoicesController */],
  providers: [/* PdfService */],
})
export class InvoicesModule {}
