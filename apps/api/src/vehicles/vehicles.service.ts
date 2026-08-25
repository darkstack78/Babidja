import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListVehiclesDto } from './dto/list-vehicles.dto';

const PAGE_SIZE = 20;

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListVehiclesDto) {
    const page = query.page ?? 1;
    const where = {
      isActive: true,
      ...(query.category ? { category: query.category } : {}),
      ...(query.city ? { tenant: { city: query.city } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({ where, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { data, total, page };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id }, include: { tenant: true } });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable');
    return vehicle;
  }
}
