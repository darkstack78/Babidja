import { IsIn, IsOptional, IsString } from 'class-validator';

/**
 * SEC-07 : Body typ\u00e9 pour le webhook CinetPay.
 * \u00c9vite de d\u00e9sactiver la ValidationPipe globale avec body: any.
 * Les champs suppl\u00e9mentaires sont bloqu\u00e9s par whitelist:true dans ValidationPipe.
 */
export class CinetPayWebhookDto {
  @IsString()
  transaction_id!: string;

  @IsString()
  @IsIn(['ACCEPTED', 'REFUSED', 'CANCELLED', 'PENDING'])
  status!: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}
