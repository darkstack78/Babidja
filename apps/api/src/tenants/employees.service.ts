import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.tenantEmployee.findMany({ where: { tenantId }, include: { user: true } });
  }

  create(tenantId: string, userId: string, role: UserRole, permissions: string[] = []) {
    return this.prisma.tenantEmployee.create({ data: { tenantId, userId, role, permissions } });
  }

  async update(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    // Empêche un TENANT_ADMIN d'un établissement de modifier un employé d'un autre établissement
    // en devinant son id (l'URL /tenant/:tenantId/employees/:employeeId ne garantit pas à elle
    // seule que employeeId appartient à tenantId).
    const employee = await this.prisma.tenantEmployee.findUnique({ where: { id } });
    if (!employee || employee.tenantId !== tenantId) {
      throw new NotFoundException('Employé introuvable pour cet établissement.');
    }
    // SEC : on ne spread jamais `dto` tel quel dans `data` — on reconstruit explicitement
    // à partir des champs validés par UpdateEmployeeDto, pour qu'un champ non prévu par le
    // DTO (ex. tenantId/userId) ne puisse jamais atteindre Prisma même si le DTO évolue
    // sans discipline plus tard (voir audit sécurité du 2026-07-10).
    return this.prisma.tenantEmployee.update({
      where: { id },
      data: { role: dto.role, permissions: dto.permissions, isActive: dto.isActive },
    });
  }
}
