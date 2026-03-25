import { Controller, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { OgService } from './og.service';

@ApiTags('og')
@Controller('api/v1/og')
export class OgController {
  constructor(private readonly ogService: OgService) {}

  @Get('pool/:poolId')
  @ApiOperation({ summary: 'Generate dynamic OpenGraph image for a pool' })
  @ApiParam({ name: 'poolId', description: 'Pool ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'OpenGraph SVG image generated successfully',
    content: { 'image/svg+xml': {} }
  })
  @ApiResponse({ status: 404, description: 'Pool not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generatePoolOgImage(@Param('poolId') poolId: string, @Res() res: Response) {
    try {
      const svgContent = await this.ogService.generatePoolOgImage(poolId);
      
      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Content-Type-Options': 'nosniff'
      });
      
      res.send(svgContent);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to generate OG image', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
