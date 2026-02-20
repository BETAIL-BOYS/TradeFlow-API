import { Injectable } from '@nestjs/common';

@Injectable()
export class RiskService {
  calculateScore(amount: number, date: Date): number {
    let baseScore = 90; // Default score for amounts between 1000 and 10000

    if (amount > 10000) {
      baseScore = 80;
    } else if (amount < 1000) {
      baseScore = 95;
    }

    // Generate a deterministic hash based on amount and date
    // to simulate a consistent "AI analysis" result for the exact same inputs
    const seedString = `${amount}-${date.getTime()}`;
    const hash = this.generateHash(seedString);

    // Generate a pseudo-random variation between -5 and +5
    const variation = (hash % 11) - 5;

    let finalScore = baseScore + variation;

    // Ensure score is strictly between 0 and 100
    if (finalScore > 100) {
      finalScore = 100;
    } else if (finalScore < 0) {
      finalScore = 0;
    }

    return finalScore;
  }

  private generateHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
