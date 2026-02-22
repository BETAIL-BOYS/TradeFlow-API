"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const risk_service_1 = require("./risk/risk.service");
async function testRiskService() {
    const riskService = new risk_service_1.RiskService();
    console.log('--- Testing RiskService ---');
    const lowAmount = 500;
    const date1 = new Date('2023-10-01T10:00:00Z');
    const score1 = riskService.calculateScore(lowAmount, date1);
    console.log(`Amount: ${lowAmount}, Date: ${date1.toISOString()} -> Score: ${score1} (Expected near 95)`);
    const highAmount = 15000;
    const date2 = new Date('2023-10-02T10:00:00Z');
    const score2 = riskService.calculateScore(highAmount, date2);
    console.log(`Amount: ${highAmount}, Date: ${date2.toISOString()} -> Score: ${score2} (Expected near 80)`);
    const midAmount = 5500;
    const date3 = new Date('2023-10-03T10:00:00Z');
    const score3 = riskService.calculateScore(midAmount, date3);
    console.log(`Amount: ${midAmount}, Date: ${date3.toISOString()} -> Score: ${score3} (Expected near 87-88)`);
    const score4 = riskService.calculateScore(midAmount, date3);
    console.log(`Repeated Call -> Score: ${score4} (Expected: ${score3}) - ${score3 === score4 ? 'PASS' : 'FAIL'}`);
    try {
        riskService.calculateScore(-100, new Date());
        console.log('Negative Amount Test: FAIL (Should throw error)');
    }
    catch (e) {
        console.log(`Negative Amount Test: PASS (Error: ${e.message})`);
    }
    try {
        riskService.calculateScore(1000, new Date('invalid-date'));
        console.log('Invalid Date Test: FAIL (Should throw error)');
    }
    catch (e) {
        console.log(`Invalid Date Test: PASS (Error: ${e.message})`);
    }
}
testRiskService();
//# sourceMappingURL=test-risk.js.map