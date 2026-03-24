import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SwapService } from './swap.service';

export class EstimatePriceImpactDto {
  amountIn: number;
}

@ApiTags('swap')
@Controller('api/v1/swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estimate price impact for a swap' })
  @ApiBody({ type: EstimatePriceImpactDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Price impact calculated successfully',
    schema: {
      type: 'object',
      properties: {
        amountIn: { type: 'number', description: 'Input amount' },
        priceImpact: { type: 'string', description: 'Price impact percentage' },
        timestamp: { type: 'string', description: 'Calculation timestamp' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async estimatePriceImpact(@Body() body: EstimatePriceImpactDto) {
    return this.swapService.calculatePriceImpact(body.amountIn);
  }
}
