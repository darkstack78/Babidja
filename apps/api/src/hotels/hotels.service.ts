import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourceType, TenantType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListHotelsDto } from './dto/list-hotels.dto';

const PAGE_SIZE = 20;

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListHotelsDto) {
    const page = query.page ?? 1;
    const where = {
      type: TenantType.HOTEL,
      isActive: true,
      ...(query.city ? { city: query.city } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    // TODO: filtrage par priceMin/priceMax/amenities/disponibilité une fois le module availability implémenté.
    return { data, total, page };
  }

  async findOne(id: string) {
    const hotel = await this.prisma.tenant.findFirst({
      where: { id, type: TenantType.HOTEL },
      include: { rooms: true },
    });
    if (!hotel) throw new NotFoundException('Hôtel introuvable');
    return hotel;
  }

  /**
   * Disponibilité par chambre pour un hôtel donné. Une date sans ligne Availability
   * est disponible par convention (voir bookings.service.ts : les lignes ne sont
   * créées qu'à la réservation, jamais pré-générées) — seules les dates BOOKED/BLOCKED
   * apparaissent explicitement ici.
   */
  async availability(hotelId: string, start: Date, end: Date) {
    const hotel = await this.prisma.tenant.findFirst({ where: { id: hotelId, type: TenantType.HOTEL } });
    if (!hotel) throw new NotFoundException('Hôtel introuvable');

    const rooms = await this.prisma.room.findMany({ where: { tenantId: hotelId }, select: { id: true } });
    const roomIds = rooms.map((r) => r.id);
    const rows = roomIds.length
      ? await this.prisma.availability.findMany({
          where: { resourceType: ResourceType.ROOM, resourceId: { in: roomIds }, date: { gte: start, lte: end } },
          orderBy: { date: 'asc' },
        })
      : [];

    const byRoom = new Map<string, typeof rows>();
    for (const id of roomIds) byRoom.set(id, []);
    for (const row of rows) byRoom.get(row.resourceId)?.push(row);

    return roomIds.map((roomId) => ({ roomId, dates: byRoom.get(roomId) ?? [] }));
  }

  async reviews(hotelId: string, page = 1) {
    const where = { tenantId: hotelId };
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { booking: { select: { resourceType: true, resourceId: true } } },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { data, total, page };
  }
}
