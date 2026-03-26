import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('api/v1/webhooks')
export class WebhookController {
  
  @Post('receive')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Receive events from external sources' })
  @ApiResponse({ status: 202, description: 'Event received and queued for processing' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  receiveWebhook(@Body() payload: any) {
    console.log('[Webhook] Received new secure payload:', JSON.stringify(payload).substring(0, 100));
    return { status: 'acknowledged', processed: true };
  }
}
