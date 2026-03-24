import { Controller, Get, Query } from '@nestjs/common';

@Controller('api/v1/stats')
export class StatsController {
  @Get('tvl')
  async getTVL(@Query('format') format?: string) {
    const staticTVL = 14500000.50;
    const lastUpdated = '2026-03-19T00:00:00Z';

    if (format === 'short') {
      // Format as "14.5M" for short display
      const formattedTVL = this.formatTVL(staticTVL);
      return {
        tvlUSD: formattedTVL,
        lastUpdated,
      };
    }

    return {
      tvlUSD: staticTVL,
      lastUpdated,
    };
  }

  private formatTVL(amount: number): string {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    } else {
      return amount.toString();
    }
  }
}
