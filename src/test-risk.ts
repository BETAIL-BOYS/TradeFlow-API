import { RiskService } from './risk/risk.service';

async function testRiskService() {
  const riskService = new RiskService();

  console.log('--- Testing RiskService ---');

  // Test Case 1: Low Amount (< 1000)
  const lowAmount = 500;
  const date1 = new Date('2023-10-01T10:00:00Z');
  const score1 = riskService.calculateScore(lowAmount, date1);
  console.log(`Amount: ${lowAmount}, Date: ${date1.toISOString()} -> Score: ${score1} (Expected near 95)`);

  // Test Case 2: High Amount (> 10000)
  const highAmount = 15000;
  const date2 = new Date('2023-10-02T10:00:00Z');
  const score2 = riskService.calculateScore(highAmount, date2);
  console.log(`Amount: ${highAmount}, Date: ${date2.toISOString()} -> Score: ${score2} (Expected near 80)`);

  // Test Case 3: Mid Amount (5500 - midpoint)
  // Linear interpolation: 95 + (5500-1000) * (80-95)/(10000-1000)
  // = 95 + 4500 * (-15/9000) = 95 + 4500 * (-1/600) = 95 - 7.5 = 87.5
  const midAmount = 5500;
  const date3 = new Date('2023-10-03T10:00:00Z');
  const score3 = riskService.calculateScore(midAmount, date3);
  console.log(`Amount: ${midAmount}, Date: ${date3.toISOString()} -> Score: ${score3} (Expected near 87-88)`);

  // Test Case 4: Reproducibility
  const score4 = riskService.calculateScore(midAmount, date3);
  console.log(`Repeated Call -> Score: ${score4} (Expected: ${score3}) - ${score3 === score4 ? 'PASS' : 'FAIL'}`);

  // Test Case 5: Error Handling - Negative Amount
  try {
    riskService.calculateScore(-100, new Date());
    console.log('Negative Amount Test: FAIL (Should throw error)');
  } catch (e) {
    console.log(`Negative Amount Test: PASS (Error: ${e.message})`);
  }

  // Test Case 6: Error Handling - Invalid Date
  try {
    riskService.calculateScore(1000, new Date('invalid-date'));
    console.log('Invalid Date Test: FAIL (Should throw error)');
  } catch (e) {
    console.log(`Invalid Date Test: PASS (Error: ${e.message})`);
  }
}

testRiskService();
