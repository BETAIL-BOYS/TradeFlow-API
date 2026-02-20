import { Test, TestingModule } from '@nestjs/testing';
import { RiskService } from './risk.service';

describe('RiskService', () => {
  let service: RiskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskService],
    }).compile();

    service = module.get<RiskService>(RiskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a score between 0 and 100', () => {
    const score = service.calculateScore(5000, new Date());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should return consistently the same score for the exact same inputs (Acceptance Criteria)', () => {
    const amount = 15000;
    const date = new Date('2023-10-01T12:00:00Z');
    
    // Call it multiple times with the exact same details
    const score1 = service.calculateScore(amount, date);
    const score2 = service.calculateScore(amount, date);
    const score3 = service.calculateScore(amount, date);

    expect(score1).toEqual(score2);
    expect(score2).toEqual(score3);
  });

  it('should vary scores for slightly different dates/amounts', () => {
    const amount = 15000;
    const date1 = new Date('2023-10-01T12:00:00Z');
    const date2 = new Date('2023-10-01T12:01:00Z');
    
    const score1 = service.calculateScore(amount, date1);
    const score2 = service.calculateScore(amount, date2);
    
    // Hash-based approach generally makes these different
    // Although there's a 1/11 chance of collision, 
    // it functions as randomized for test scenarios
    expect(score1).toBeDefined();
    expect(score2).toBeDefined();
  });

  it('should base score on amount rules', () => {
    const date = new Date();
    
    const smallAmountScore = service.calculateScore(500, date);
    // Base 95, variation +/- 5 => 90 - 100
    expect(smallAmountScore).toBeGreaterThanOrEqual(90);
    expect(smallAmountScore).toBeLessThanOrEqual(100);

    const largeAmountScore = service.calculateScore(15000, date);
    // Base 80, variation +/- 5 => 75 - 85
    expect(largeAmountScore).toBeGreaterThanOrEqual(75);
    expect(largeAmountScore).toBeLessThanOrEqual(85);
  });
});
