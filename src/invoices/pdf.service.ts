import { Injectable } from '@nestjs/common';
const pdfParse = require('pdf-parse');

export interface ParsedInvoice {
  totalAmount?: number;
  dueDate?: string;
}

@Injectable()
export class PdfService {
  async parseInvoicePdf(pdfBuffer: Buffer): Promise<ParsedInvoice> {
    try {
      const data = await pdfParse(pdfBuffer);
      const text = data.text;

      const totalAmount = this.extractTotalAmount(text);
      const dueDate = this.extractDueDate(text);

      return {
        totalAmount,
        dueDate,
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  private extractTotalAmount(text: string): number | undefined {
    // Regex patterns to find currency amounts
    const patterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // $1,200.00
      /USD\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // USD 1,200.00
      /Total[:\s]*(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // Total: $1,200.00
      /Amount[:\s]*(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // Amount: $1,200.00
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/gi, // 1,200.00 USD
    ];

    let amounts: number[] = [];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Extract numeric value from the match
          const numericMatch = match.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (numericMatch) {
            const amount = parseFloat(numericMatch[1].replace(/,/g, ''));
            if (!isNaN(amount) && amount > 0) {
              amounts.push(amount);
            }
          }
        }
      }
    }

    // Return the largest amount (likely the total)
    return amounts.length > 0 ? Math.max(...amounts) : undefined;
  }

  private extractDueDate(text: string): string | undefined {
    // Regex patterns to find dates
    const patterns = [
      /Due[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi, // Due: 12/31/2023
      /Due\s*Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi, // Due Date: 12/31/2023
      /Payment\s*Due[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi, // Payment Due: 12/31/2023
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:due|payment)/gi, // 12/31/2023 due
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Extract the date part
        const dateMatch = match[0].match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (dateMatch) {
          return this.normalizeDate(dateMatch[1]);
        }
      }
    }

    return undefined;
  }

  private normalizeDate(dateString: string): string {
    // Convert various date formats to ISO format (YYYY-MM-DD)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateString;
  }
}
