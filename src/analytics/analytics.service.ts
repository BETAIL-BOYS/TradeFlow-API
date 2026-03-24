import { Injectable } from '@nestjs/common';

export interface VolumeData {
  date: string;
  volumeUSD: number;
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
}
