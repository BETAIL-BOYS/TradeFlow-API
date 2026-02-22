import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ 
    description: 'The total amount of the invoice. Must be a positive number.', 
    example: 5000.00,
    type: Number
  })
  amount: number;

  @ApiProperty({ 
    description: 'The date of the invoice in ISO 8601 format.', 
    example: '2023-10-27T10:00:00Z',
    type: String
  })
  date: string;

  @ApiProperty({ 
    description: 'The name of the customer issuing the invoice.', 
    example: 'Acme Corp',
    type: String
  })
  customer: string;

  @ApiProperty({ 
    description: 'A brief description of the goods or services provided.', 
    example: 'Consulting services for Q3', 
    required: false,
    type: String
  })
  description?: string;
}
