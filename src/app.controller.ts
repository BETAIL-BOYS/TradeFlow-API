import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('invoices')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInvoices() {
    return this.appService.getAllInvoices();
  }

  @Post()
  createInvoice(@Body() body: any) {
    return this.appService.processNewInvoice(body);
  }
}
