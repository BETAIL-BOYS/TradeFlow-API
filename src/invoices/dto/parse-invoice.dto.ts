import { IsNotEmpty, IsString } from 'class-validator';

export class ParseInvoiceDto {
  @IsNotEmpty()
  @IsString()
  filename: string;
}
