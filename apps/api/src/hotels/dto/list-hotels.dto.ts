import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';

export class ListHotelsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  checkIn?: string;

  @IsOptional()
  @IsString()
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @IsArray()
  amenities?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
