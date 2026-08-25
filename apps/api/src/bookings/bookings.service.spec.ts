import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, ResourceType } from '@prisma/client';
import { BookingsService } from './bookings.service';

describe('BookingsService — createBooking', () => {
  let service: BookingsService;
  let fakePrisma: any;

  // basePrice est un Prisma.Decimal en production (jamais un number brut) : le mock
  // doit refléter ce type pour détecter un usage de Number()/arithmétique flottante.
  const room = { id: 'standard', tenantId: 'tenant-1', basePrice: new Prisma.Decimal(45000), isActive: true };

  const fakeConfig = {
    get: (key: string) => (key === 'deposit.rateDefault' ? 0.3 : undefined),
  } as unknown as ConfigService;

  const fakeReferralService = { creditReward: jest.fn().mockResolvedValue(undefined) } as any;

  beforeEach(() => {
    fakePrisma = {
      room: { findFirst: jest.fn().mockResolvedValue(room) },
      vehicle: { findFirst: jest.fn() },
      availability: {
        upsert: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      booking: {
        create: jest.fn().mockImplementation(async ({ data }: any) => ({ id: 'booking-1', ...data })),
      },
      $queryRaw: jest.fn().mockResolvedValue([
        { status: 'AVAILABLE' },
        { status: 'AVAILABLE' },
        { status: 'AVAILABLE' },
      ]),
      $transaction: jest.fn().mockImplementation((cb: any) => cb(fakePrisma)),
    };

    service = new BookingsService(fakePrisma, fakeConfig, fakeReferralService);
  });

  const baseDto = {
    resourceType: ResourceType.ROOM,
    resourceId: 'standard',
    startDate: '2026-10-12',
    endDate: '2026-10-15', // 3 nuits
  };

  it('calcule un acompte (30%) quand paymentType=DEPOSIT', async () => {
    const booking = await service.createBooking({ ...baseDto, paymentType: 'DEPOSIT' } as any, 'user-1');

    expect(Number(booking.totalAmount)).toBe(135000); // 45000 * 3 nuits
    expect(Number(booking.depositAmount)).toBe(40500); // 30%
    expect(Number(booking.remainingAmount)).toBe(94500);
    expect(booking.tenantId).toBe('tenant-1'); // dérivé de la ressource, jamais du client
  });

  it('paie la totalité quand paymentType=FULL (pas de solde restant)', async () => {
    const booking = await service.createBooking({ ...baseDto, paymentType: 'FULL' } as any, 'user-1');

    expect(Number(booking.totalAmount)).toBe(135000);
    expect(Number(booking.depositAmount)).toBe(135000);
    expect(Number(booking.remainingAmount)).toBe(0);
  });

  it("rejette (404) si la ressource n'existe pas ou est inactive", async () => {
    fakePrisma.room.findFirst.mockResolvedValue(null);
    await expect(
      service.createBooking({ ...baseDto, paymentType: 'FULL' } as any, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejette (409) si une des dates est déjà BOOKED', async () => {
    fakePrisma.$queryRaw.mockResolvedValue([{ status: 'AVAILABLE' }, { status: 'BOOKED' }]);
    await expect(
      service.createBooking({ ...baseDto, paymentType: 'FULL' } as any, 'user-1'),
    ).rejects.toThrow(ConflictException);
    // Le statut ne doit jamais être flippé à BOOKED si la vérification échoue.
    expect(fakePrisma.availability.updateMany).not.toHaveBeenCalled();
  });

  it('génère un bookingRef non vide et un statut PENDING', async () => {
    const booking = await service.createBooking({ ...baseDto, paymentType: 'FULL' } as any, 'user-1');
    expect(booking.bookingRef).toMatch(/^BJ/);
    expect(booking.status).toBe('PENDING');
  });

  it("rejette (400) une date de début dans le passé", async () => {
    await expect(
      service.createBooking(
        { ...baseDto, startDate: '2020-01-01', endDate: '2020-01-05', paymentType: 'FULL' } as any,
        'user-1',
      ),
    ).rejects.toThrow('La date de début ne peut pas être dans le passé.');
  });

  it('uniformise en ConflictException une violation de contrainte unique sous concurrence (P2002)', async () => {
    fakePrisma.availability.upsert.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
      }),
    );
    await expect(
      service.createBooking({ ...baseDto, paymentType: 'FULL' } as any, 'user-1'),
    ).rejects.toThrow(ConflictException);
  });
});
