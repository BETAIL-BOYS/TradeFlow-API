import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService, VolumeData } from './analytics.service';

@ApiTags('Analytics')
@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('volume')
  @ApiOperation({ summary: 'Get historical trading volume data' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved volume data',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string', example: '2024-01-15' },
          volumeUSD: { type: 'number', example: 250000 },
        },
      },
    },
  })
  getVolumeData(): VolumeData[] {
    return this.analyticsService.generateMockVolumeData();
  }
}
