import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookingStatus, Prisma, ResourceType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { getDateRange } from '../common/date-range';
import { ReferralService } from '../referral/referral.service';
import { CreateBookingDto } from './dto/create-booking.dto';

interface BookableResource {
  tenantId: string;
  price: Prisma.Decimal;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly referralService: ReferralService,
  ) {}

  /**
   * ⚠ Logique critique (section 5.1 du document technique) : deux clients ne
   * doivent jamais pouvoir réserver la même ressource sur des dates qui se
   * chevauchent. Le snippet du document suppose que les lignes Availability
   * existent déjà pour verrouiller (SELECT ... FOR UPDATE) — en pratique rien
   * ne les pré-génère, donc on les crée d'abord (upsert, idempotent grâce à la
   * contrainte unique [resourceType, resourceId, date]) avant de les verrouiller
   * explicitement et de vérifier leur statut. Voir bookings.service.spec.ts et
   * test/booking-concurrency.e2e-spec.ts pour la validation sous concurrence réelle.
   */
  async createBooking(dto: CreateBookingDto, userId: string) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début.');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new BadRequestException('La date de début ne peut pas être dans le passé.');
    }

    const resource = await this.getResource(dto.resourceType, dto.resourceId);
    const dates = getDateRange(startDate, endDate);
    if (dates.length === 0) {
      throw new BadRequestException('La réservation doit couvrir au moins une nuit/un jour.');
    }

    const CONFLICT_MESSAGE = 'Ces dates ne sont plus disponibles pour cette ressource.';

    try {
      return await this.prisma.$transaction(async (tx) => {
      for (const date of dates) {
        await tx.availability.upsert({
          where: {
            resourceType_resourceId_date: { resourceType: dto.resourceType, resourceId: dto.resourceId, date },
          },
          update: {},
          create: { resourceType: dto.resourceType, resourceId: dto.resourceId, date, status: 'AVAILABLE' },
        });
      }

      const slots = await tx.$queryRaw<{ status: string }[]>`
        SELECT status FROM "Availability"
        WHERE "resourceType" = ${dto.resourceType}::"ResourceType"
          AND "resourceId" = ${dto.resourceId}
          AND "date" = ANY(${dates}::timestamp[])
        FOR UPDATE
      `;
      if (slots.some((s) => s.status !== 'AVAILABLE')) {
        throw new ConflictException('Ces dates ne sont plus disponibles pour cette ressource.');
      }

      await tx.availability.updateMany({
        where: { resourceType: dto.resourceType, resourceId: dto.resourceId, date: { in: dates } },
        data: { status: 'BOOKED' },
      });

      // Arithmétique en Prisma.Decimal (jamais Number()) : resource.price est un
      // Decimal, et des montants FCFA élevés multipliés/arrondis en flottant JS
      // peuvent créer un écart de quelques francs entre total/acompte/reste.
      const nights = dates.length;
      const depositRate = this.config.get<number>('deposit.rateDefault') ?? 0.3;
      const totalAmount = resource.price.mul(nights);
      const depositAmount =
        dto.paymentType === 'DEPOSIT' ? totalAmount.mul(depositRate).toDecimalPlaces(0) : totalAmount;
      const remainingAmount = totalAmount.sub(depositAmount);

      return tx.booking.create({
        data: {
          bookingRef: this.generateBookingRef(),
          userId,
          tenantId: resource.tenantId,
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
          startDate,
          endDate,
          totalAmount,
          depositAmount,
          remainingAmount,
          options: dto.options as Prisma.InputJsonValue | undefined,
          status: 'PENDING',
        },
      });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Deux requêtes concurrentes peuvent toutes les deux passer le upsert() avant que le
        // verrou FOR UPDATE ne les sérialise : l'une des deux lève alors une violation de
        // contrainte unique brute plutôt que le ConflictException levé plus haut. On uniformise
        // le message pour ne jamais exposer une erreur Prisma interne au client.
        throw new ConflictException(CONFLICT_MESSAGE);
      }
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    if (booking.userId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à consulter cette réservation.");
    }
    return booking;
  }

  async findUserBookings(userId: string, status?: BookingStatus) {
    return this.prisma.booking.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        review: true,
        tenant: true,
      },
    });
  }

  /**
   * BACK-01 : Annulation d'une réservation.
   * - Seules les réservations PENDING ou CONFIRMED peuvent être annulées.
   * - Les créneaux Availability sont libérés (status → AVAILABLE) dans la même transaction.
   * - La politique de remboursement est à implémenter (webhook CinetPay ou crédit wallet).
   */
  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    if (booking.userId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas autorisé à annuler cette réservation.");
    }
    const cancellableStatuses: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new BadRequestException(`Impossible d'annuler une réservation avec le statut « ${booking.status} ».`);
    }

    // Déterminer les dates couvertes pour libérer les créneaux
    const dates = getDateRange(booking.startDate, booking.endDate);

    return this.prisma.$transaction(async (tx) => {
      // 1. Marquer la réservation comme annulée
      const cancelled = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          options: {
            ...(typeof booking.options === 'object' && booking.options !== null ? booking.options as Record<string, unknown> : {}),
            cancellationReason: reason ?? null,
            cancelledAt: new Date().toISOString(),
          },
        },
      });

      // 2. Libérer les créneaux de disponibilité (important : empêche des blocages permanents)
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

      return cancelled;
    });
  }

  async confirm(bookingId: string) {
    // Appelé par le webhook CinetPay (payments.service) après paiement réussi.
    const booking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { user: true },
    });
    // Le crédit de parrainage se déclenche à la première réservation CONFIRMED du
    // filleul ; creditReward() est lui-même idempotent (garde rewardStatus=PENDING).
    await this.referralService.creditReward(booking.userId);
    return booking;
  }

  /**
   * BACK-01 : Création d'un avis.
   * - La réservation doit appartenir à l'utilisateur et être COMPLETED ou CONFIRMED.
   * - Un seul avis par réservation (contrainte unique dans le schéma Prisma).
   * - La note doit être entre 1 et 5.
   */
  async createReview(bookingId: string, userId: string, rating: number, comment?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    if (booking.userId !== userId) {
      throw new ForbiddenException("Vous ne pouvez pas noter une réservation qui n'est pas la vôtre.");
    }
    const reviewableStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.COMPLETED];
    if (!reviewableStatuses.includes(booking.status)) {
      throw new BadRequestException('Vous ne pouvez noter que les réservations confirmées ou terminées.');
    }
    if (booking.review) {
      throw new ConflictException('Vous avez déjà noté cette réservation.');
    }
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('La note doit être comprise entre 1 et 5.');
    }

    return this.prisma.review.create({
      data: {
        bookingId,
        userId,
        tenantId: booking.tenantId,
        rating,
        comment,
      },
    });
  }

  private async getResource(resourceType: ResourceType, resourceId: string): Promise<BookableResource> {
    if (resourceType === ResourceType.ROOM) {
      const room = await this.prisma.room.findFirst({ where: { id: resourceId, isActive: true } });
      if (!room) throw new NotFoundException('Chambre introuvable.');
      return { tenantId: room.tenantId, price: room.basePrice };
    }
    const vehicle = await this.prisma.vehicle.findFirst({ where: { id: resourceId, isActive: true } });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable.');
    return { tenantId: vehicle.tenantId, price: vehicle.pricePerDay };
  }

  private generateBookingRef(): string {
    return `BJ${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`;
  }
}
