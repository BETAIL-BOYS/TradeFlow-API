import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from '@stellar/stellar-sdk';

@Injectable()
export class IndexerService implements OnModuleInit {
  private server: Server;
  private readonly POLLING_INTERVAL = 5000; // 5 seconds
  private readonly CONTRACT_ID = process.env.CONTRACT_ID || '';
  private readonly INVOICE_MINTED_TOPIC = 'InvoiceMinted';

  constructor() {
    // Initialize Stellar server (using testnet by default, can be configured via env)
    this.server = new Server(
      process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
    );
  }

  async onModuleInit() {
    console.log('IndexerService starting...');
    
    if (!this.CONTRACT_ID) {
      console.warn('CONTRACT_ID not set in environment variables');
      return;
    }

    // Start polling for events
    this.startPolling();
  }

  private startPolling() {
    console.log(`Starting to poll for ${this.INVOICE_MINTED_TOPIC} events from contract ${this.CONTRACT_ID}`);
    
    setInterval(async () => {
      try {
        await this.pollForEvents();
      } catch (error) {
        console.error('Error polling for events:', error);
      }
    }, this.POLLING_INTERVAL);
  }

  private async pollForEvents() {
    try {
      // Get events from the Stellar server
      const events = await this.server.getEvents({
        contract: this.CONTRACT_ID,
        topics: [[this.INVOICE_MINTED_TOPIC]],
      });

      if (events.records.length > 0) {
        console.log(`Found ${events.records.length} events`);
        
        for (const event of events.records) {
          this.processInvoiceMintedEvent(event);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }

  private processInvoiceMintedEvent(event: any) {
    try {
      // Extract event data
      const eventData = event.value;
      
      // Assuming the event structure contains invoice_id and amount
      // This may need adjustment based on actual event structure
      const invoiceId = eventData.invoice_id || eventData.invoiceId || 'N/A';
      const amount = eventData.amount || 'N/A';

      console.log(`InvoiceMinted Event Detected:`);
      console.log(`  - Invoice ID: ${invoiceId}`);
      console.log(`  - Amount: ${amount}`);
      console.log(`  - Transaction Hash: ${event.transaction_hash}`);
      console.log(`  - Timestamp: ${event.created_at}`);
      console.log('---');
    } catch (error) {
      console.error('Error processing InvoiceMinted event:', error);
    }
  }
}
