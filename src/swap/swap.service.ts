import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SwapService {
  calculatePriceImpact(amountIn: number) {
    if (!amountIn || amountIn <= 0) {
      throw new BadRequestException('amountIn must be a positive number');
    }

    let priceImpact: string;

    if (amountIn < 1000) {
      priceImpact = '0.1%';
    } else if (amountIn > 10000) {
      priceImpact = '2.5%';
    } else {
      // For amounts between 1000 and 10000, we can add linear scaling
      // This is a simple linear interpolation between 0.1% and 2.5%
      const ratio = (amountIn - 1000) / (10000 - 1000);
      const impactPercentage = 0.1 + ratio * (2.5 - 0.1);
      priceImpact = `${impactPercentage.toFixed(2)}%`;
    }

    return {
      amountIn,
      priceImpact,
      timestamp: new Date().toISOString(),
    };
  }
}
