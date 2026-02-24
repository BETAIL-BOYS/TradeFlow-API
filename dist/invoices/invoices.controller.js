"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const pdf_service_1 = require("./pdf.service");
const parse_invoice_dto_1 = require("./dto/parse-invoice.dto");
let InvoicesController = class InvoicesController {
    constructor(pdfService) {
        this.pdfService = pdfService;
    }
    async parseInvoice(file, body) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Only PDF files are allowed');
        }
        try {
            const result = await this.pdfService.parseInvoicePdf(file.buffer);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse invoice: ${error.message}`);
        }
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)('parse'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Parse PDF invoice to extract total amount and due date' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invoice parsed successfully',
        schema: {
            type: 'object',
            properties: {
                totalAmount: { type: 'number', description: 'Total amount found in invoice' },
                dueDate: { type: 'string', description: 'Due date found in invoice (YYYY-MM-DD format)' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or parsing failed' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, parse_invoice_dto_1.ParseInvoiceDto]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "parseInvoice", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [pdf_service_1.PdfService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map