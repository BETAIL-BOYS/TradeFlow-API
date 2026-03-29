import { IsNotEmpty, IsString } from 'class-validator';

export class PoolIdParamDto {
  @IsNotEmpty()
  @IsString()
  poolId: string;
}

