import { OrderStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  assetPair: string;

  @ApiProperty()
  side: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  quantity: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  executedAt?: Date;
}
