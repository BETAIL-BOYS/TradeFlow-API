"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfParse = require('pdf-parse');
let PdfService = class PdfService {
    async parseInvoicePdf(pdfBuffer) {
        try {
            const data = await pdfParse(pdfBuffer);
            const text = data.text;
            const totalAmount = this.extractTotalAmount(text);
            const dueDate = this.extractDueDate(text);
            return {
                totalAmount,
                dueDate,
            };
        }
        catch (error) {
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }
    extractTotalAmount(text) {
        const patterns = [
            /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
            /USD\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
            /Total[:\s]*(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
            /Amount[:\s]*(\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
            /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/gi,
        ];
        let amounts = [];
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                for (const match of matches) {
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
        return amounts.length > 0 ? Math.max(...amounts) : undefined;
    }
    extractDueDate(text) {
        const patterns = [
            /Due[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /Due\s*Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /Payment\s*Due[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s*(?:due|payment)/gi,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const dateMatch = match[0].match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
                if (dateMatch) {
                    return this.normalizeDate(dateMatch[1]);
                }
            }
        }
        return undefined;
    }
    normalizeDate(dateString) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
        return dateString;
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map