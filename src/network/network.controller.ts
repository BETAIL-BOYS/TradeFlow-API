import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Network')
@Controller('api/v1/network')
export class NetworkController {
  @Get('fees')
  @ApiOperation({ summary: 'Get estimated network gas fees', description: 'Get current Stellar network fee estimates in stroops' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved network fee estimates',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            baseFee: { type: 'number', example: 100 },
            priorityFee: { type: 'number', example: 500 },
            estimatedTotal: { type: 'number', example: 600 }
          }
        },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  getNetworkFees(@Res() res: Response) {
    // Generate realistic mock Stellar network fees
    const fees = {
      baseFee: 100, // Base fee in stroops (0.00001 XLM)
      priorityFee: Math.floor(Math.random() * 1000) + 200, // Priority fee between 200-1200 stroops
      estimatedTotal: 0 // Will be calculated
    };
    
    fees.estimatedTotal = fees.baseFee + fees.priorityFee;

    const response = {
      success: true,
      data: fees,
      timestamp: new Date().toISOString()
    };

    // Set cache header for 30 seconds
    res.set('Cache-Control', 'public, max-age=30');
    res.status(HttpStatus.OK).json(response);
  }
}
