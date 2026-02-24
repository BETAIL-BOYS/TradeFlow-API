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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    getChallenge() {
        const nonce = this.authService.generateNonce();
        return { nonce };
    }
    async login(body) {
        const { publicKey, signature, nonce } = body;
        if (!publicKey || !signature || !nonce) {
            throw new common_1.HttpException('Missing required fields: publicKey, signature, nonce', common_1.HttpStatus.BAD_REQUEST);
        }
        const isValid = await this.authService.verifySignature(publicKey, signature, nonce);
        if (!isValid) {
            throw new common_1.HttpException('Invalid signature', common_1.HttpStatus.UNAUTHORIZED);
        }
        const token = this.authService.generateJWT(publicKey);
        return { token };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('challenge'),
    (0, swagger_1.ApiOperation)({ summary: 'Get authentication challenge nonce' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nonce generated successfully', schema: { type: 'object', properties: { nonce: { type: 'string' } } } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getChallenge", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with wallet signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentication successful', schema: { type: 'object', properties: { token: { type: 'string' } } } }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid signature' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing required fields' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map