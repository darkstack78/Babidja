import { Injectable } from '@nestjs/common';
import { ResourceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  findRange(resourceType: ResourceType, resourceId: string, start: Date, end: Date) {
    return this.prisma.availability.findMany({
      where: { resourceType, resourceId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });
  }

  // La logique de lock anti double-réservation (SELECT ... FOR UPDATE dans une
  // transaction) est implémentée dans BookingsService.createBooking — voir
  // section 5.1 du document technique backend. À faire lors de l'implémentation
  // complète du module bookings.
}
