import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class AddPaymentMethodDto {
  @IsEnum(PaymentMethod)
  provider!: PaymentMethod;

  // Référence opaque renvoyée par le provider (CinetPay) après tokenisation —
  // jamais de numéro de carte/mobile money en clair.
  @IsString()
  tokenizedRef!: string;

  @IsOptional()
  @IsString()
  label?: string;
}
