import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApyHistoryPoint, generateMockApyHistory } from './apy-history.helper';
import { PoolIdParamDto } from './dto/pool-id-param.dto';

type ApyHistoryResponse = {
  status: 'success';
  data: ApyHistoryPoint[];
};

@ApiTags('pools')
@Controller('api/v1/pools')
export class PoolsController {
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
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2026-03-29' },
              apyPercentage: { type: 'number', example: 9.87 },
            },
          },
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
}

