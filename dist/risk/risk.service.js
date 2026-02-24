"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskService = void 0;
const common_1 = require("@nestjs/common");
let RiskService = class RiskService {
    constructor() {
        this.LCG_A = 1664525;
        this.LCG_C = 1013904223;
        this.LCG_M = 4294967296;
    }
    calculateScore(amount, date) {
        this.validateInputs(amount, date);
        let baseScore;
        if (amount < 1000) {
            baseScore = 95;
        }
        else if (amount > 10000) {
            baseScore = 80;
        }
        else {
            const x = amount;
            const x1 = 1000;
            const y1 = 95;
            const x2 = 10000;
            const y2 = 80;
            baseScore = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
        }
        const seed = this.generateSeed(amount, date);
        const randomFactor = this.seededRandom(seed);
        const variability = (randomFactor * 10) - 5;
        let finalScore = baseScore + variability;
        finalScore = Math.max(0, Math.min(100, finalScore));
        return Math.round(finalScore);
    }
    validateInputs(amount, date) {
        if (amount === null || amount === undefined || typeof amount !== 'number' || isNaN(amount)) {
            throw new common_1.BadRequestException('Amount must be a valid number.');
        }
        if (amount < 0) {
            throw new common_1.BadRequestException('Amount cannot be negative.');
        }
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            throw new common_1.BadRequestException('Date must be a valid Date object.');
        }
    }
    generateSeed(amount, date) {
        const inputString = `${amount}-${date.getTime()}`;
        let hash = 0;
        for (let i = 0; i < inputString.length; i++) {
            const char = inputString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    seededRandom(seed) {
        const next = (this.LCG_A * seed + this.LCG_C) % this.LCG_M;
        return next / this.LCG_M;
    }
};
exports.RiskService = RiskService;
exports.RiskService = RiskService = __decorate([
    (0, common_1.Injectable)()
], RiskService);
//# sourceMappingURL=risk.service.js.map