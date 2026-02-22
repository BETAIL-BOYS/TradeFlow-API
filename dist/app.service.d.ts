import { CreateInvoiceDto } from './invoices/dto/create-invoice.dto';
import { InvoiceDto } from './invoices/dto/invoice.dto';
export declare class AppService {
    private invoices;
    getAllInvoices(): InvoiceDto[];
    processNewInvoice(data: CreateInvoiceDto): InvoiceDto;
}
