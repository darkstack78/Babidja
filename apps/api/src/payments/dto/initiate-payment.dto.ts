import { IsEnum, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class InitiatePaymentDto {
  @IsString()
  bookingId!: string;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
