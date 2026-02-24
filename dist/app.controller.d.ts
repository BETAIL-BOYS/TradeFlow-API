import { AppService } from './app.service';
import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getInvoices(): InvoiceDto[];
    createInvoice(createInvoiceDto: CreateInvoiceDto): InvoiceDto;
}
