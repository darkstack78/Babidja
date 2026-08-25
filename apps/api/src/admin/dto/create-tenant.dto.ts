import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TenantType } from '@prisma/client';

export class CreateTenantDto {
  @IsString()
  name!: string;

  @IsEnum(TenantType)
  type!: TenantType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
