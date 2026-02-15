import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private invoices = [];

  // GET: Fetch all invoices
  getAllInvoices() {
    return this.invoices;
  }

  // POST: Create Invoice & Calculate Risk
  processNewInvoice(data: any) {
    // Mock Risk Logic: Random Score 50-99
    const riskScore = Math.floor(Math.random() * 50) + 50; 
    
    const newInvoice = {
      id: Date.now().toString(),
      ...data,
      riskScore: riskScore,
      status: riskScore > 70 ? 'Approved' : 'High Risk',
      timestamp: new Date().toISOString()
    };

    this.invoices.push(newInvoice);
    return newInvoice;
  }
}
