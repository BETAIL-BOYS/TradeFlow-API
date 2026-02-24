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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const swagger_1 = require("@nestjs/swagger");
const create_invoice_dto_1 = require("./invoices/dto/create-invoice.dto");
const invoice_dto_1 = require("./invoices/dto/invoice.dto");
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getInvoices() {
        return this.appService.getAllInvoices();
    }
    createInvoice(createInvoiceDto) {
        return this.appService.processNewInvoice(createInvoiceDto);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve all invoices', description: 'Returns a list of all processed invoices' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of invoices retrieved successfully.',
        type: [invoice_dto_1.InvoiceDto]
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], AppController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice', description: 'Submits a new invoice for risk assessment and processing' }),
    (0, swagger_1.ApiBody)({ type: create_invoice_dto_1.CreateInvoiceDto, description: 'Invoice details' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Invoice created and processed successfully.',
        type: invoice_dto_1.InvoiceDto
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", invoice_dto_1.InvoiceDto)
], AppController.prototype, "createInvoice", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('Invoices'),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map