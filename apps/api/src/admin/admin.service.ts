import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [tenantsByType, usersByRole, bookingsByStatus, revenue] = await Promise.all([
      this.prisma.tenant.groupBy({ by: ['type'], _count: { _all: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.payment.aggregate({ where: { status: PaymentStatus.SUCCESS }, _sum: { amount: true } }),
    ]);

    const tenantCounts = Object.fromEntries(tenantsByType.map((row) => [row.type, row._count._all]));
    const userCounts = Object.fromEntries(usersByRole.map((row) => [row.role, row._count._all]));
    const bookingCounts = Object.fromEntries(bookingsByStatus.map((row) => [row.status, row._count._all]));

    return {
      totalTenants: tenantsByType.reduce((sum, row) => sum + row._count._all, 0),
      hotelsCount: tenantCounts.HOTEL ?? 0,
      carRentalsCount: tenantCounts.CAR_RENTAL ?? 0,
      totalUsers: usersByRole.reduce((sum, row) => sum + row._count._all, 0),
      customersCount: userCounts.CUSTOMER ?? 0,
      totalBookings: bookingsByStatus.reduce((sum, row) => sum + row._count._all, 0),
      pendingBookings: bookingCounts.PENDING ?? 0,
      confirmedBookings: bookingCounts.CONFIRMED ?? 0,
      totalRevenue: revenue._sum.amount ?? 0,
    };
  }

  listTenants() {
    return this.prisma.tenant.findMany();
  }

  createTenant(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: dto });
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Établissement introuvable.');
    return this.prisma.tenant.update({ where: { id: tenantId }, data: dto });
  }

  listTransactions() {
    return this.prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
