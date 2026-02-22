import { ApiProperty } from '@nestjs/swagger';

export class InvoiceDto {
  @ApiProperty({ 
    description: 'The unique identifier of the invoice', 
    example: '1698400000000',
    type: String
  })
  id: string;

  @ApiProperty({ 
    description: 'The total amount of the invoice', 
    example: 5000.00,
    type: Number
  })
  amount: number;

  @ApiProperty({ 
    description: 'The date of the invoice', 
    example: '2023-10-27T10:00:00Z',
    type: String
  })
  date: string;

  @ApiProperty({ 
    description: 'The customer name', 
    example: 'Acme Corp',
    type: String
  })
  customer: string;

  @ApiProperty({ 
    description: 'Invoice description', 
    example: 'Consulting services for Q3', 
    required: false,
    type: String
  })
  description?: string;

  @ApiProperty({ 
    description: 'Risk score calculated by the engine (0-100)', 
    example: 85,
    type: Number
  })
  riskScore: number;

  @ApiProperty({ 
    description: 'Status of the invoice based on risk score', 
    example: 'Approved',
    enum: ['Approved', 'High Risk']
  })
  status: string;

  @ApiProperty({ 
    description: 'Timestamp when the invoice was processed', 
    example: '2023-10-27T10:00:05Z',
    type: String
  })
  timestamp: string;
}
