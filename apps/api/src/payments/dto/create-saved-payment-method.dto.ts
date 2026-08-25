import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateSavedPaymentMethodDto {
  @IsEnum(PaymentMethod)
  provider: PaymentMethod;

  /**
   * Référence opaque renvoyée par le provider (numéro tokenisé, etc.).
   * On n'autorise jamais un PAN/CVV en clair ici.
   */
  @IsString()
  tokenizedRef: string;

  /** Libellé lisible par l'utilisateur (ex : "Mon Orange Money", "+225 07 …") */
  @IsOptional()
  @IsString()
  label?: string;
}
