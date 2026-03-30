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

export interface LeaderboardEntry {
  walletAddress: string;
  volumeUSD: number;
  rank: number;
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

  generateLeaderboard(): LeaderboardEntry[] {
    // Generate dummy wallet addresses (truncated for privacy)
    const dummyWallets = [
      '0x742d...8b4c',
      '0x8f3a...2d1e',
      '0x1a9c...5f7b',
      '0x6e2d...9a3c',
      '0x4b8f...1e2d',
      '0x9c3a...7f5b',
      '0x2d8f...4c1e',
      '0x5a7b...9d2f',
      '0x8e1c...3a6b',
      '0x3f9d...2e8c'
    ];

    // Generate realistic trading volumes (sorted in descending order)
    const baseVolumes = [850000, 720000, 650000, 580000, 490000, 420000, 380000, 310000, 270000, 220000];
    
    const leaderboard: LeaderboardEntry[] = dummyWallets.map((wallet, index) => ({
      walletAddress,
      volumeUSD: baseVolumes[index] + Math.round(Math.random() * 50000 - 25000),
      rank: index + 1
    }));

    return leaderboard;
  }
}
