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
exports.InvoiceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class InvoiceDto {
}
exports.InvoiceDto = InvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The unique identifier of the invoice',
        example: '1698400000000',
        type: String
    }),
    __metadata("design:type", String)
], InvoiceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The total amount of the invoice',
        example: 5000.00,
        type: Number
    }),
    __metadata("design:type", Number)
], InvoiceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date of the invoice',
        example: '2023-10-27T10:00:00Z',
        type: String
    }),
    __metadata("design:type", String)
], InvoiceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The customer name',
        example: 'Acme Corp',
        type: String
    }),
    __metadata("design:type", String)
], InvoiceDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice description',
        example: 'Consulting services for Q3',
        required: false,
        type: String
    }),
    __metadata("design:type", String)
], InvoiceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Risk score calculated by the engine (0-100)',
        example: 85,
        type: Number
    }),
    __metadata("design:type", Number)
], InvoiceDto.prototype, "riskScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the invoice based on risk score',
        example: 'Approved',
        enum: ['Approved', 'High Risk']
    }),
    __metadata("design:type", String)
], InvoiceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the invoice was processed',
        example: '2023-10-27T10:00:05Z',
        type: String
    }),
    __metadata("design:type", String)
], InvoiceDto.prototype, "timestamp", void 0);
//# sourceMappingURL=invoice.dto.js.map