import { Controller, Get, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {}

  @Get('health')
  async healthCheck() {
    try {
      const isConnected = this.dataSource.isInitialized;
      
      if (isConnected) {
        return {
          status: 'ok',
          database: 'up',
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new HttpException(
          {
            status: 'error',
            database: 'down',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          database: 'down',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('api/v1/status')
  async systemStatus() {
    try {
      const uptime = process.uptime();
      
      return {
        operational: 'operational',
        uptime: Math.floor(uptime),
        services: {
          database: 'connected',
          stellar_rpc: 'connected'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        {
          operational: 'degraded',
          uptime: Math.floor(process.uptime()),
          services: {
            database: 'error',
            stellar_rpc: 'error'
          },
          timestamp: new Date().toISOString(),
          error: 'System status check failed'
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
