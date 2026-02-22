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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInvoiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateInvoiceDto {
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The total amount of the invoice. Must be a positive number.',
        example: 5000.00,
        type: Number
    }),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date of the invoice in ISO 8601 format.',
        example: '2023-10-27T10:00:00Z',
        type: String
    }),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The name of the customer issuing the invoice.',
        example: 'Acme Corp',
        type: String
    }),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'A brief description of the goods or services provided.',
        example: 'Consulting services for Q3',
        required: false,
        type: String
    }),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "description", void 0);
//# sourceMappingURL=create-invoice.dto.js.map