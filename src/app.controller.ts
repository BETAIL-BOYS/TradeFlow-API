import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all invoices', description: 'Returns a list of all processed invoices' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of invoices retrieved successfully.', 
    type: [InvoiceDto] 
  })
  getInvoices(): InvoiceDto[] {
    return this.appService.getAllInvoices();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice', description: 'Submits a new invoice for risk assessment and processing' })
  @ApiBody({ type: CreateInvoiceDto, description: 'Invoice details' })
  @ApiResponse({ 
    status: 201, 
    description: 'Invoice created and processed successfully.', 
    type: InvoiceDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto): InvoiceDto {
    return this.appService.processNewInvoice(createInvoiceDto);
  }
}
