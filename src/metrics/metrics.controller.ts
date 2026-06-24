import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  MetricsService,
  TvlMetrics,
  RevenueMetrics,
  ActiveUsersMetrics,
} from './metrics.service';

/**
 * Controller for administrative protocol metrics endpoints.
 * Provides global TVL, cumulative protocol revenue, and active trader statistics.
 * All routes require a valid admin JWT.
 */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('api/v1/admin/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Retrieves global Total Value Locked across all active pools.
   *
   * @returns Wrapped TVL metrics response.
   */
  @Get('tvl')
  @ApiOperation({ summary: 'Get global protocol TVL' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved global TVL',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            tvlUSD: { type: 'number', example: 14500000.5 },
            poolCount: { type: 'number', example: 12 },
            lastUpdated: { type: 'string', example: '2026-06-24T12:00:00.000Z' },
          },
        },
        timestamp: { type: 'string', example: '2026-06-24T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, description: 'Metrics not yet computed' })
  async getTvl(): Promise<{ success: boolean; data: TvlMetrics; timestamp: string }> {
    const data = await this.metricsService.getTvl();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieves total cumulative protocol fees routed to the Treasury.
   *
   * @returns Wrapped revenue metrics response.
   */
  @Get('revenue')
  @ApiOperation({ summary: 'Get cumulative protocol revenue' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved protocol revenue',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalRevenueUSD: { type: 'number', example: 125000.75 },
            lastUpdated: { type: 'string', example: '2026-06-24T12:00:00.000Z' },
          },
        },
        timestamp: { type: 'string', example: '2026-06-24T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, description: 'Metrics not yet computed' })
  async getRevenue(): Promise<{ success: boolean; data: RevenueMetrics; timestamp: string }> {
    const data = await this.metricsService.getRevenue();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieves active unique trader counts for 24h, 7d, and 30d windows.
   *
   * @returns Wrapped active users metrics response.
   */
  @Get('active-users')
  @ApiOperation({ summary: 'Get active unique trader counts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved active user counts',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            activeUsers24h: { type: 'number', example: 142 },
            activeUsers7d: { type: 'number', example: 890 },
            activeUsers30d: { type: 'number', example: 3200 },
            lastUpdated: { type: 'string', example: '2026-06-24T12:00:00.000Z' },
          },
        },
        timestamp: { type: 'string', example: '2026-06-24T12:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.SERVICE_UNAVAILABLE, description: 'Metrics not yet computed' })
  async getActiveUsers(): Promise<{
    success: boolean;
    data: ActiveUsersMetrics;
    timestamp: string;
  }> {
    const data = await this.metricsService.getActiveUsers();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
