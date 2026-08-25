import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

const EMPLOYEE_ROLES = [UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE] as const;

// SEC : ne JAMAIS ajouter tenantId/userId ici. C'est le seul rempart contre
// l'injection d'un tenantId dans le corps de la requête (le ValidationPipe
// global whitelist/forbidNonWhitelisted ne s'applique qu'aux vraies classes
// DTO — un type inline ou `unknown` laisse passer n'importe quel champ, voir
// audit sécurité du 2026-07-10).
export class UpdateEmployeeDto {
  @IsOptional()
  @IsIn(EMPLOYEE_ROLES)
  role?: (typeof EMPLOYEE_ROLES)[number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
