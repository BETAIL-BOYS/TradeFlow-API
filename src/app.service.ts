import { Injectable } from '@nestjs/common';
import { RiskService } from './risk/risk.service';

@Injectable()
export class AppService {
  private invoices = [];

  constructor(private readonly riskService: RiskService) {}

  // GET: Fetch all invoices
  getAllInvoices() {
    return this.invoices;
  }

  // POST: Create Invoice & Calculate Risk
  processNewInvoice(data: any) {
    const amount = Number(data.amount) || 0;
    const date = data.date ? new Date(data.date) : new Date();

    const riskScore = this.riskService.calculateScore(amount, date);
    
    const newInvoice = {
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
