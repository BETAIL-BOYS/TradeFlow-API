import { PdfService, ParsedInvoice } from './pdf.service';
import { ParseInvoiceDto } from './dto/parse-invoice.dto';
export declare class InvoicesController {
    private readonly pdfService;
    constructor(pdfService: PdfService);
    parseInvoice(file: Express.Multer.File, body: ParseInvoiceDto): Promise<ParsedInvoice>;
}
