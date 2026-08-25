import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, ResourceType, TenantType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getDateRange } from '../common/date-range';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CatalogueItemDto } from './dto/catalogue-item.dto';

// Transitions manuelles autorisées pour le staff d'un établissement. PENDING n'est
// jamais une cible : c'est l'état initial à la création, jamais un retour possible.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  CANCELLED: [],
  COMPLETED: [],
};

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(tenantId: string) {
    const [byStatus, revenue, upcomingBookings] = await Promise.all([
      this.prisma.booking.groupBy({ by: ['status'], where: { tenantId }, _count: { _all: true } }),
      this.prisma.booking.aggregate({
        where: { tenantId, status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.booking.count({
        where: { tenantId, status: BookingStatus.CONFIRMED, startDate: { gte: new Date() } },
      }),
    ]);

    const counts = Object.fromEntries(byStatus.map((row) => [row.status, row._count._all])) as Partial<
      Record<BookingStatus, number>
    >;

    return {
      totalBookings: byStatus.reduce((sum, row) => sum + row._count._all, 0),
      pendingBookings: counts.PENDING ?? 0,
      confirmedBookings: counts.CONFIRMED ?? 0,
      cancelledBookings: counts.CANCELLED ?? 0,
      completedBookings: counts.COMPLETED ?? 0,
      upcomingBookings,
      totalRevenue: revenue._sum.totalAmount ?? 0,
    };
  }

  listBookings(tenantId: string) {
    return this.prisma.booking.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } },
    });
  }

  async updateBookingStatus(tenantId: string, bookingId: string, status: BookingStatus) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    // Scopé par tenantId : un établissement ne doit jamais pouvoir modifier la
    // réservation d'un autre établissement en devinant un bookingId.
    if (!booking || booking.tenantId !== tenantId) {
      throw new NotFoundException('Réservation introuvable pour cet établissement.');
    }
    if (!ALLOWED_TRANSITIONS[booking.status].includes(status)) {
      throw new BadRequestException(`Transition de « ${booking.status} » vers « ${status} » impossible.`);
    }

    if (status === BookingStatus.CANCELLED) {
      const dates = getDateRange(booking.startDate, booking.endDate);
      return this.prisma.$transaction(async (tx) => {
        if (dates.length > 0) {
          await tx.availability.updateMany({
            where: {
              resourceType: booking.resourceType,
              resourceId: booking.resourceId,
              date: { in: dates },
              status: 'BOOKED',
            },
            data: { status: 'AVAILABLE' },
          });
        }
        return tx.booking.update({ where: { id: bookingId }, data: { status } });
      });
    }

    return this.prisma.booking.update({ where: { id: bookingId }, data: { status } });
  }

  async getAvailability(tenantId: string, start: Date, end: Date) {
    const [rooms, vehicles] = await Promise.all([
      this.prisma.room.findMany({ where: { tenantId }, select: { id: true } }),
      this.prisma.vehicle.findMany({ where: { tenantId }, select: { id: true } }),
    ]);
    const resourceIds = [...rooms.map((r) => r.id), ...vehicles.map((v) => v.id)];
    if (resourceIds.length === 0) return [];

    return this.prisma.availability.findMany({
      where: { resourceId: { in: resourceIds }, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });
  }

  async updateAvailability(tenantId: string, dto: UpdateAvailabilityDto) {
    await this.assertResourceOwnership(tenantId, dto.resourceType, dto.resourceId);

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) {
      throw new BadRequestException('La date de fin doit être postérieure ou égale à la date de début.');
    }
    // getDateRange traite sa borne de fin comme exclusive : +1 jour pour inclure endDate.
    const dates = getDateRange(start, new Date(end.getTime() + 24 * 60 * 60 * 1000));
    const status = dto.status ?? 'BLOCKED';

    return this.prisma.$transaction(
      dates.map((date) =>
        this.prisma.availability.upsert({
          where: {
            resourceType_resourceId_date: { resourceType: dto.resourceType, resourceId: dto.resourceId, date },
          },
          update: { status, ...(dto.customPrice !== undefined ? { customPrice: dto.customPrice } : {}) },
          create: {
            resourceType: dto.resourceType,
            resourceId: dto.resourceId,
            date,
            status,
            customPrice: dto.customPrice,
          },
        }),
      ),
    );
  }

  async listCatalogue(tenantId: string) {
    const [rooms, vehicles] = await Promise.all([
      this.prisma.room.findMany({ where: { tenantId } }),
      this.prisma.vehicle.findMany({ where: { tenantId } }),
    ]);
    return { rooms, vehicles };
  }

  async createCatalogueItem(tenantId: string, dto: CatalogueItemDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Établissement introuvable.');

    if (tenant.type === TenantType.HOTEL) {
      if (!dto.name || dto.price === undefined || dto.maxGuests === undefined) {
        throw new BadRequestException('name, price et maxGuests sont requis pour créer une chambre.');
      }
      return this.prisma.room.create({
        data: {
          tenantId,
          name: dto.name,
          description: dto.description,
          basePrice: dto.price,
          maxGuests: dto.maxGuests,
          images: dto.images ?? [],
          amenities: dto.amenities ?? [],
          capacityAdults: dto.capacityAdults ?? 1,
          capacityChildren: dto.capacityChildren ?? 0,
          sizeSqm: dto.sizeSqm,
          kind: dto.kind ?? 'room',
        },
      });
    }

    if (!dto.brand || !dto.model || dto.price === undefined || !dto.category || !dto.transmission || dto.seats === undefined) {
      throw new BadRequestException(
        'brand, model, category, seats, transmission et price sont requis pour créer un véhicule.',
      );
    }
    return this.prisma.vehicle.create({
      data: {
        tenantId,
        brand: dto.brand,
        model: dto.model,
        description: dto.description,
        category: dto.category,
        seats: dto.seats,
        transmission: dto.transmission,
        hasAC: dto.hasAC ?? true,
        pricePerDay: dto.price,
        images: dto.images ?? [],
      },
    });
  }

  async updateCatalogueItem(tenantId: string, itemId: string, dto: CatalogueItemDto) {
    const room = await this.prisma.room.findUnique({ where: { id: itemId } });
    if (room) {
      if (room.tenantId !== tenantId) {
        throw new NotFoundException('Chambre introuvable pour cet établissement.');
      }
      return this.prisma.room.update({
        where: { id: itemId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.price !== undefined ? { basePrice: dto.price } : {}),
          ...(dto.maxGuests !== undefined ? { maxGuests: dto.maxGuests } : {}),
          ...(dto.images !== undefined ? { images: dto.images } : {}),
          ...(dto.amenities !== undefined ? { amenities: dto.amenities } : {}),
          ...(dto.capacityAdults !== undefined ? { capacityAdults: dto.capacityAdults } : {}),
          ...(dto.capacityChildren !== undefined ? { capacityChildren: dto.capacityChildren } : {}),
          ...(dto.sizeSqm !== undefined ? { sizeSqm: dto.sizeSqm } : {}),
          ...(dto.kind !== undefined ? { kind: dto.kind } : {}),
        },
      });
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: itemId } });
    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Élément de catalogue introuvable pour cet établissement.');
    }
    return this.prisma.vehicle.update({
      where: { id: itemId },
      data: {
        ...(dto.brand !== undefined ? { brand: dto.brand } : {}),
        ...(dto.model !== undefined ? { model: dto.model } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.seats !== undefined ? { seats: dto.seats } : {}),
        ...(dto.transmission !== undefined ? { transmission: dto.transmission } : {}),
        ...(dto.hasAC !== undefined ? { hasAC: dto.hasAC } : {}),
        ...(dto.price !== undefined ? { pricePerDay: dto.price } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
      },
    });
  }

  private async assertResourceOwnership(tenantId: string, resourceType: ResourceType, resourceId: string) {
    if (resourceType === ResourceType.ROOM) {
      const room = await this.prisma.room.findUnique({ where: { id: resourceId } });
      if (!room || room.tenantId !== tenantId) {
        throw new NotFoundException('Chambre introuvable pour cet établissement.');
      }
      return;
    }
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: resourceId } });
    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Véhicule introuvable pour cet établissement.');
    }
  }
}
