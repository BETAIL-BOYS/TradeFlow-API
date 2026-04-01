import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { HmacSignatureGuard } from './guards/hmac-signature.guard';

@ApiTags('webhooks')
@Controller('api/v1/webhook')
export class WebhookController {
  
  @Post('soroban')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HmacSignatureGuard)
  @ApiOperation({ 
    summary: 'Stellar Soroban event webhook receiver',
    description: 'Receives and processes incoming smart contract events. Requires HMAC signature verification and JWT authentication.'
  })
  @ApiHeader({
    name: 'X-Signature',
    description: 'HMAC-SHA256 signature of the request body signed with WEBHOOK_SECRET',
    required: true
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <JWT_TOKEN>',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  @ApiResponse({ status: 400, description: 'Missing or empty request body or missing X-Signature header' })
  @ApiResponse({ status: 401, description: 'Invalid webhook signature or unauthorized' })
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
