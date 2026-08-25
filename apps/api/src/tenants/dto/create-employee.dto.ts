import { IsArray, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '@prisma/client';

const EMPLOYEE_ROLES = [UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE] as const;

export class CreateEmployeeDto {
  @IsUUID()
  userId!: string;

  @IsIn(EMPLOYEE_ROLES)
  role!: (typeof EMPLOYEE_ROLES)[number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
