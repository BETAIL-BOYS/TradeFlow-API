import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GasService } from './gas.service';

@ApiTags('Gas')
@Controller('api/v1/gas')
export class GasController {
  constructor(private readonly gasService: GasService) {}

  @Get('estimate')
  @ApiOperation({ summary: 'Get cached Stellar fee tiers (Low, Medium, High)' })
  async estimate() {
    return this.gasService.getFeeTiers();
  }
}
