"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const stellar_sdk_1 = require("@stellar/stellar-sdk");
let AuthService = class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        this.jwtExpiration = '1h';
    }
    generateNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
    async verifySignature(publicKey, signature, nonce) {
        try {
            const message = `Sign in to TradeFlow with nonce: ${nonce}`;
            const messageBuffer = Buffer.from(message);
            const signatureBuffer = Buffer.from(signature, 'base64');
            const keypair = stellar_sdk_1.Keypair.fromPublicKey(publicKey);
            const isValid = keypair.verify(messageBuffer, signatureBuffer);
            return isValid;
        }
        catch (error) {
            return false;
        }
    }
    generateJWT(publicKey) {
        const payload = {
            publicKey,
            sub: publicKey,
            iat: Math.floor(Date.now() / 1000),
        };
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiration,
        });
    }
    verifyJWT(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map