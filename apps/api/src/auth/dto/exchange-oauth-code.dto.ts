import { IsNotEmpty, IsString } from 'class-validator';

export class ExchangeOAuthCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
