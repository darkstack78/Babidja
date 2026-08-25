import { IsDateString, IsEnum, IsString } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class FindAvailabilityDto {
  @IsEnum(ResourceType)
  resourceType!: ResourceType;

  @IsString()
  resourceId!: string;

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;
}
