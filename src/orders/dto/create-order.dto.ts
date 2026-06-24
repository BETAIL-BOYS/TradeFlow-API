import { IsString, IsIn, IsNumberString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'User wallet address' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Trading pair (e.g. XLM/USDC)' })
  @IsString()
  @IsNotEmpty()
  assetPair: string;

  @ApiProperty({ description: 'Order side', enum: ['BUY', 'SELL'] })
  @IsString()
  @IsIn(['BUY', 'SELL'])
  side: string;

  @ApiProperty({ description: 'Limit price' })
  @IsNumberString()
  price: string;

  @ApiProperty({ description: 'Order quantity' })
  @IsNumberString()
  quantity: string;
}
