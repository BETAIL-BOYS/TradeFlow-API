import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApyHistoryPoint, generateMockApyHistory } from './apy-history.helper';
import { PoolIdParamDto } from './dto/pool-id-param.dto';

interface ApyHistoryResponse {
  status: 'success';
  data: ApyHistoryPoint[];
}

/**
 * Controller for liquidity pool information and history.
 * Provides simulated APY history and recent trade data for pools.
 */
@ApiTags('pools')
@Controller('api/v1/pools')
export class PoolsController {
  /**
   * Retrieves a 7-day simulated APY history for a specific pool.
   * 
   * @param params - The DTO containing the poolId.
   * @returns An array of ApyHistoryPoint objects.
   */
  @Get(':poolId/apy-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get 7-day simulated APY history for a pool' })
  @ApiParam({ name: 'poolId', description: 'Pool ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'APY history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ApyHistoryPoint' },
        },
      },
    },
  })
  getApyHistory(@Param() params: PoolIdParamDto): ApyHistoryResponse {
    return {
      status: 'success',
      data: generateMockApyHistory(params.poolId),
    };
  }

  /**
   * Retrieves recent mock trade activity for a specific pool.
   * 
   * @param params - The DTO containing the poolId.
   * @param limitRaw - Optional query parameter to limit the number of returned trades.
   * @returns An object containing the pool ID, trade count, and a list of mock trades.
   */
  @Get(':poolId/trades')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recent mock trades for a pool' })
  @ApiParam({ name: 'poolId', description: 'Pool ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Recent trades retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        poolId: { type: 'string', example: 'pool-123' },
        count: { type: 'number', example: 10 },
        trades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', example: '2026-04-25T08:59:00.000Z' },
              amountIn: { type: 'string', example: '125.50' },
              amountOut: { type: 'string', example: '124.93' },
              wallet: { type: 'string', example: 'GABCD...WXYZ' },
            },
          },
        },
      },
    },
  })
  getPoolTrades(
    @Param() params: PoolIdParamDto,
    @Query('limit') limitRaw?: string,
  ) {
    const parsedLimit = Number.parseInt(String(limitRaw ?? ''), 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit >= 1
      ? Math.min(parsedLimit, 100)
      : 10;

    const baseTime = Date.now();
    const trades = Array.from({ length: 20 }, (_, i) => {
      const timestamp = new Date(baseTime - i * 60_000).toISOString();

      const amountIn = (100 + ((i + params.poolId.length) % 20) * 5 + (i % 10) * 0.13).toFixed(2);
      const amountOut = (Number(amountIn) * (0.995 - (i % 5) * 0.0005)).toFixed(2);

      const wallet = `G${params.poolId.replace(/[^A-Za-z0-9]/g, '').toUpperCase().padEnd(10, 'X').slice(0, 10)}${String(i).padStart(2, '0')}WALLET`;

      return {
        timestamp,
        amountIn,
        amountOut,
        wallet,
      };
    }).slice(0, Math.min(limit, 20));

    return {
      poolId: params.poolId,
      count: trades.length,
      trades,
    };
  }
}
