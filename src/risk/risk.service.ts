import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class RiskService {
  // Linear Congruential Generator constants for pseudo-random number generation
  private readonly LCG_A = 1664525;
  private readonly LCG_C = 1013904223;
  private readonly LCG_M = 4294967296;

  /**
   * Calculates the risk score for an invoice.
   * Returns a score between 0 and 100.
   * Higher score = Lower risk / Greater loan approval likelihood.
   * 
   * @param amount Invoice amount (must be non-negative number)
   * @param date Invoice date (must be valid Date object)
   * @returns Risk Score (integer between 0 and 100)
   */
  calculateScore(amount: number, date: Date): number {
    // 1. Input Validation
    this.validateInputs(amount, date);

    // 2. Base Score Calculation
    let baseScore: number;

    if (amount < 1000) {
      baseScore = 95;
    } else if (amount > 10000) {
      baseScore = 80;
    } else {
      // Linear interpolation for amount between 1000 and 10000
      // Formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      // Points: (1000, 95) -> (10000, 80)
      const x = amount;
      const x1 = 1000;
      const y1 = 95;
      const x2 = 10000;
      const y2 = 80;

      baseScore = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
    }

    // 3. Randomization (±5 points)
    // Seed based on amount and date to ensure reproducibility for the same invoice inputs
    const seed = this.generateSeed(amount, date);
    const randomFactor = this.seededRandom(seed); // Returns 0 to 1
    
    // Map 0..1 to -5..+5
    // value = (random * 10) - 5
    const variability = (randomFactor * 10) - 5;

    let finalScore = baseScore + variability;

    // 4. Clamping (0-100) and Integer Conversion
    finalScore = Math.max(0, Math.min(100, finalScore));

    return Math.round(finalScore);
  }

  private validateInputs(amount: number, date: Date): void {
    if (amount === null || amount === undefined || typeof amount !== 'number' || isNaN(amount)) {
      throw new BadRequestException('Amount must be a valid number.');
    }
    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative.');
    }
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new BadRequestException('Date must be a valid Date object.');
    }
  }

  /**
   * Generates a deterministic seed based on input parameters.
   * This ensures that the same invoice (same amount and date) always gets the same random factor.
   */
  private generateSeed(amount: number, date: Date): number {
    // Create a string representation to hash
    // Using date.getTime() ensures we use the exact timestamp
    const inputString = `${amount}-${date.getTime()}`;
    
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Simple Linear Congruential Generator for seeded random numbers.
   * Returns a number between 0 (inclusive) and 1 (exclusive).
   */
  private seededRandom(seed: number): number {
    // next = (a * seed + c) % m
    const next = (this.LCG_A * seed + this.LCG_C) % this.LCG_M;
    return next / this.LCG_M;
  }
}
