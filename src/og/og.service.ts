import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Injectable()
export class OgService {
  private readonly logger = new Logger(OgService.name);

  async generatePoolOgImage(poolId: string): Promise<string> {
    try {
      // For now, use dummy data as per requirements
      // In a real implementation, you would fetch this data from your database
      const poolData = await this.getPoolData(poolId);
      
      return this.generateSvgTemplate(poolData);
    } catch (error) {
      this.logger.error(`Error generating OG image for pool ${poolId}:`, error);
      throw new HttpException('Pool not found', HttpStatus.NOT_FOUND);
    }
  }

  private async getPoolData(poolId: string): Promise<{
    token0Symbol: string;
    token1Symbol: string;
    tvl: string;
    volume24h: string;
    apr: string;
  }> {
    // Dummy data as per requirements
    // In production, this would fetch real data from your database
    const dummyPools: Record<string, any> = {
      'pool1': {
        token0Symbol: 'USDC',
        token1Symbol: 'XLM',
        tvl: '$1,234,567',
        volume24h: '$456,789',
        apr: '12.5%'
      },
      'pool2': {
        token0Symbol: 'EURT',
        token1Symbol: 'USDT',
        tvl: '$987,654',
        volume24h: '$234,567',
        apr: '8.3%'
      }
    };

    // Return dummy data for any pool ID
    return dummyPools[poolId] || {
      token0Symbol: 'TOKENA',
      token1Symbol: 'TOKENB',
      tvl: '$500,000',
      volume24h: '$100,000',
      apr: '15.0%'
    };
  }

  private generateSvgTemplate(poolData: {
    token0Symbol: string;
    token1Symbol: string;
    tvl: string;
    volume24h: string;
    apr: string;
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1f2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d3748;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4299e1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#667eea;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)" />
  
  <!-- TradeFlow branding -->
  <text x="60" y="80" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">
    TradeFlow
  </text>
  <text x="60" y="120" font-family="Arial, sans-serif" font-size="24" fill="#a0aec0">
    Decentralized Trading Protocol
  </text>
  
  <!-- Token pair -->
  <text x="60" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="600" fill="#ffffff">
    ${poolData.token0Symbol} / ${poolData.token1Symbol}
  </text>
  
  <!-- Pool stats container -->
  <rect x="60" y="240" width="1080" height="320" rx="16" fill="#2d3748" fill-opacity="0.5" stroke="url(#accentGradient)" stroke-width="2"/>
  
  <!-- TVL -->
  <text x="120" y="320" font-family="Arial, sans-serif" font-size="20" fill="#a0aec0">
    Total Value Locked
  </text>
  <text x="120" y="360" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#4299e1">
    ${poolData.tvl}
  </text>
  
  <!-- 24h Volume -->
  <text x="460" y="320" font-family="Arial, sans-serif" font-size="20" fill="#a0aec0">
    24h Volume
  </text>
  <text x="460" y="360" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#48bb78">
    ${poolData.volume24h}
  </text>
  
  <!-- APR -->
  <text x="800" y="320" font-family="Arial, sans-serif" font-size="20" fill="#a0aec0">
    APR
  </text>
  <text x="800" y="360" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ed8936">
    ${poolData.apr}
  </text>
  
  <!-- Decorative elements -->
  <circle cx="1100" cy="100" r="40" fill="url(#accentGradient)" fill-opacity="0.3"/>
  <circle cx="1050" cy="150" r="25" fill="#4299e1" fill-opacity="0.2"/>
  <circle cx="100" cy="550" r="30" fill="#667eea" fill-opacity="0.2"/>
  <circle cx="150" cy="580" r="20" fill="#48bb78" fill-opacity="0.2"/>
  
  <!-- Footer -->
  <text x="60" y="590" font-family="Arial, sans-serif" font-size="16" fill="#718096">
    tradeflow.io | Trade on Stellar
  </text>
  
  <!-- Timestamp -->
  <text x="1140" y="590" font-family="Arial, sans-serif" font-size="14" fill="#718096" text-anchor="end">
    ${new Date().toLocaleDateString()}
  </text>
</svg>`;
  }
}
