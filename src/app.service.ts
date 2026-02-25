import { Injectable } from '@nestjs/common';
import { RiskService } from './risk/risk.service';
import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';

@Injectable()
export class AppService {
  private invoices: InvoiceDto[] = [];

  constructor(private readonly riskService: RiskService) {}

  // GET: Fetch all invoices
  getAllInvoices(): InvoiceDto[] {
    return this.invoices;
  }

  // POST: Create Invoice & Calculate Risk
  processNewInvoice(data: any) {
    const amount = Number(data.amount) || 0;
    const date = data.date ? new Date(data.date) : new Date();

    const riskScore = this.riskService.calculateScore(amount, date);
  processNewInvoice(data: CreateInvoiceDto): InvoiceDto {
    // Mock Risk Logic: Random Score 50-99
    const riskScore = Math.floor(Math.random() * 50) + 50; 
    
    const newInvoice: InvoiceDto = {
      id: Date.now().toString(),
      ...data,
      riskScore: riskScore,
      status: riskScore > 70 ? 'Approved' : 'High Risk',
      timestamp: date.toISOString()
    };

    this.invoices.push(newInvoice);
    return newInvoice;
  }
}
