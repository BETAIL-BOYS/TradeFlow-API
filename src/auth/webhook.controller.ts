import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('api/v1/webhook')
export class WebhookController {
  
  @Post('soroban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Stellar Soroban event webhook receiver',
    description: 'Receives and processes incoming smart contract events. Requires JWT authentication.'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <JWT_TOKEN>',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async handleSorobanEvent(@Body() eventData: any) {
    console.log('--- Incoming Soroban Event Webhook ---');
    console.log('Payload:', JSON.stringify(eventData, null, 2));
    
    // In a production scenario, logic to respond to specific events
    // would go here (e.g. updating internal state).
    
    return {
      status: 'success',
      receivedAt: new Date().toISOString()
    };
  }
}
