import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Config')
@Controller('api/v1/config')
export class ConfigController {
  
  @Get()
  @ApiOperation({ 
    summary: 'Get application configuration', 
    description: 'Returns default configuration settings for the frontend application' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        appVersion: { type: 'string' },
        environment: { type: 'string' },
        features: { type: 'object' }
      }
    }
  })
  getConfig(@Res() res: Response) {
    // Set Cache-Control header for 5 minutes (static/slowly changing data)
    res.set('Cache-Control', 'public, max-age=300');
    
    const config = {
      appVersion: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        enableSwaps: true,
        enableAnalytics: true,
        maintenanceMode: false
      },
      lastUpdated: new Date().toISOString()
    };
    
    return res.json(config);
  }
}
