import { IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class UpdateAvailabilityDto {
  @IsEnum(ResourceType)
  resourceType!: ResourceType;

  @IsString()
  resourceId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  // BOOKED est géré exclusivement par le système de réservation (createBooking) —
  // un tenant ne peut manuellement que rendre une date disponible ou la bloquer
  // (maintenance, fermeture ponctuelle, etc).
  @IsOptional()
  @IsIn(['AVAILABLE', 'BLOCKED'])
  status?: 'AVAILABLE' | 'BLOCKED';

  @IsOptional()
  @IsNumber()
  customPrice?: number;
}
