import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PricesService } from './prices.service';

@ApiTags('prices')
@Controller('api/v1/prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current token prices' })
  @ApiResponse({ status: 200, description: 'Token prices retrieved successfully' })
  async getPrices() {
    const { data, cached } = await this.pricesService.getPrices();
    return {
      success: true,
      message: 'Prices retrieved successfully',
      data,
      meta: { count: data.length, cached },
    };
  }
}
