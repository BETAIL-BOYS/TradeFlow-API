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
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cors_config_1 = require("./cors.config");
let TestCorsController = class TestCorsController {
    getHello() {
        return 'CORS Test';
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], TestCorsController.prototype, "getHello", null);
TestCorsController = __decorate([
    (0, common_1.Controller)('test-cors')
], TestCorsController);
let TestCorsModule = class TestCorsModule {
};
TestCorsModule = __decorate([
    (0, common_1.Module)({
        controllers: [TestCorsController],
    })
], TestCorsModule);
async function runCorsTests() {
    console.log('Starting CORS tests with isolated module...');
    const app = await core_1.NestFactory.create(TestCorsModule);
    app.enableCors(cors_config_1.corsConfig);
    await app.listen(3001);
    const url = 'http://localhost:3001/test-cors';
    let passed = 0;
    let failed = 0;
    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        }
        else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };
    try {
        console.log('\n--- Test 1: Allowed Origin (Localhost) ---');
        const res1 = await fetch(url, {
            method: 'GET',
            headers: { 'Origin': 'http://localhost:3000' }
        });
        assert(res1.status === 200, 'Status should be 200');
        assert(res1.headers.get('access-control-allow-origin') === 'http://localhost:3000', 'Should allow http://localhost:3000');
        assert(res1.headers.get('access-control-allow-credentials') === 'true', 'Should allow credentials');
        console.log('\n--- Test 2: Allowed Origin (Production) ---');
        const res2 = await fetch(url, {
            method: 'GET',
            headers: { 'Origin': 'https://tradeflow-web.vercel.app' }
        });
        assert(res2.headers.get('access-control-allow-origin') === 'https://tradeflow-web.vercel.app', 'Should allow production origin');
        console.log('\n--- Test 3: Blocked Origin ---');
        const res3 = await fetch(url, {
            method: 'GET',
            headers: { 'Origin': 'http://evil.com' }
        });
        assert(res3.headers.get('access-control-allow-origin') === null, 'Should NOT send ACAO header for blocked origin');
        console.log('\n--- Test 4: Preflight Allowed Method (PUT) ---');
        const res4 = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'PUT'
            }
        });
        assert(res4.status === 204, 'Preflight status should be 204');
        assert(res4.headers.get('access-control-allow-methods').includes('PUT'), 'Should allow PUT method');
        console.log('\n--- Test 5: Preflight Blocked Method (DELETE) ---');
        const res5 = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'DELETE'
            }
        });
        const allowedMethods = res5.headers.get('access-control-allow-methods') || '';
        assert(!allowedMethods.includes('DELETE'), 'Should NOT allow DELETE method');
    }
    catch (error) {
        console.error('Test execution failed:', error);
        failed++;
    }
    finally {
        await app.close();
        console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
        if (failed > 0)
            process.exit(1);
    }
}
runCorsTests();
//# sourceMappingURL=test-cors.js.map