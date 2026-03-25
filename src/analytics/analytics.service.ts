import { Injectable } from '@nestjs/common';

export interface VolumeData {
  date: string;
  volumeUSD: number;
}

export interface ImpermanentLossData {
  entryPriceRatio: number;
  currentPriceRatio: number;
  impermanentLossPercentage: number;
}

@Injectable()
export class AnalyticsService {
  generateMockVolumeData(): VolumeData[] {
    const data: VolumeData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic volume data between $10,000 and $500,000
      const baseVolume = 250000;
      const variation = Math.random() * 200000 - 100000;
      const volumeUSD = Math.round(baseVolume + variation);
      
      data.push({
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        volumeUSD,
      });
    }
    
    return data;
  }

  calculateImpermanentLoss(entryPriceRatio: number, currentPriceRatio: number): ImpermanentLossData {
    // Validate inputs
    if (entryPriceRatio <= 0 || currentPriceRatio <= 0) {
      throw new Error('Price ratios must be positive numbers');
    }

    // Calculate price ratio (current/entry)
    const priceRatio = currentPriceRatio / entryPriceRatio;
    
    // Apply the standard IL formula: 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
    const impermanentLoss = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
    
    // Convert to percentage
    const impermanentLossPercentage = impermanentLoss * 100;

    return {
      entryPriceRatio,
      currentPriceRatio,
      impermanentLossPercentage,
    };
  }
}
