import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Un même DTO pour la création et la mise à jour d'un élément de catalogue (chambre
 * d'hôtel ou véhicule) : le type d'établissement (tenant.type) détermine côté
 * service quels champs sont réellement utilisés/requis, class-validator ne peut
 * pas exprimer cette conditionnalité proprement.
 */
export class CatalogueItemDto {
  // Commun
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  // Chambre (hôtel)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGuests?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  capacityAdults?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacityChildren?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  sizeSqm?: number;

  @IsOptional()
  @IsString()
  kind?: string;

  // Véhicule (location de voiture)
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsBoolean()
  hasAC?: boolean;
}
