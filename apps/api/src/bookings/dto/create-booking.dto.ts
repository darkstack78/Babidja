import { IsDateString, IsEnum, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateBookingDto {
  @IsEnum(ResourceType)
  resourceType!: ResourceType;

  // Pas @IsUUID() : les id de ressources ne sont pas garantis UUID (ex. slugs
  // lisibles côté seed comme "standard", "suite-junior").
  @IsString()
  resourceId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsIn(['FULL', 'DEPOSIT'])
  paymentType!: 'FULL' | 'DEPOSIT';

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
