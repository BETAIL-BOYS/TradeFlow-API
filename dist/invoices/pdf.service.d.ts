export interface ParsedInvoice {
    totalAmount?: number;
    dueDate?: string;
}
export declare class PdfService {
    parseInvoicePdf(pdfBuffer: Buffer): Promise<ParsedInvoice>;
    private extractTotalAmount;
    private extractDueDate;
    private normalizeDate;
}
