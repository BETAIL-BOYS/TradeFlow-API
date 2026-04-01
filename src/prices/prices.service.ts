import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

const cache = require('../../../utils/cache');

const CACHE_KEY = 'prices:all';

const MOCK_PRICES = [
  { symbol: 'USDC', price: 1.0 },
  { symbol: 'XLM', price: 0.12 },
];

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

  async getPrices(): Promise<{ data: { symbol: string; price: number }[]; cached: boolean }> {
    const cached = cache.get(CACHE_KEY);

    if (cached) {
      this.logger.log('🎯 Cache HIT - Returning cached prices');
      return { data: cached, cached: true };
    }

    this.logger.log('❌ Cache MISS - Fetching prices from external API');
    const prices = await this.fetchPrices();
    cache.set(CACHE_KEY, prices);

    return { data: prices, cached: false };
  }

  private async fetchPrices(): Promise<{ symbol: string; price: number }[]> {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar,usd-coin&vs_currencies=usd',
      );

      return [
        { symbol: 'USDC', price: response.data['usd-coin']?.usd ?? 1.0 },
        { symbol: 'XLM', price: response.data['stellar']?.usd ?? 0.12 },
      ];
    } catch (error) {
      this.logger.error('Failed to fetch prices from CoinGecko, using fallback data', error.message);
      return MOCK_PRICES;
    }
  }
}
