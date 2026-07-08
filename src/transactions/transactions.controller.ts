import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuildTransactionDto, TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('api/v1/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('build')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Build an unsigned Stellar transaction envelope' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['source', 'operations'],
      properties: {
        source: { type: 'string', description: 'Source Stellar public key' },
        fee: { type: 'string', description: 'Optional per-operation fee in stroops' },
        networkPassphrase: { type: 'string', description: 'Optional Stellar network passphrase' },
        timeoutSeconds: { type: 'number', description: 'Optional transaction timeout in seconds' },
        operations: {
          type: 'array',
          description: 'Sequential payment or pathPaymentStrictSend intents',
          items: { type: 'object' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Unsigned base64 XDR envelope built successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transaction build request' })
  async buildTransaction(@Body() body: BuildTransactionDto) {
    return this.transactionsService.buildTransaction(body);
  }
}
