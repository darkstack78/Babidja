import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Test explicitement demandé section 11 du document technique backend :
 * "Test de charge basique sur /bookings (requêtes concurrentes sur la même
 * ressource) avant mise en production, pour valider le comportement du lock."
 * C'est le bug le plus classique et le plus grave de ce type de plateforme
 * (section 5.1) — deux clients réservant la même chambre à la même seconde ne
 * doivent jamais réussir tous les deux. Nécessite Postgres actif.
 */
describe('Anti double-réservation (e2e, concurrence réelle)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let config: ConfigService;

  let tenantId: string;
  let roomId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    config = app.get(ConfigService);

    const tenant = await prisma.tenant.create({
      data: { name: 'Hôtel Concurrence Test', type: 'HOTEL', address: 'Abidjan', city: 'Abidjan' },
    });
    tenantId = tenant.id;

    const room = await prisma.room.create({
      data: {
        tenantId,
        name: 'Chambre Test Concurrence',
        maxGuests: 2,
        basePrice: 50000,
        capacityAdults: 2,
        capacityChildren: 0,
      },
    });
    roomId = room.id;

    const user = await prisma.user.create({
      data: { firstName: 'Client', lastName: 'Test', role: UserRole.CUSTOMER, referralCode: 'CONCUR1' },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { booking: { resourceId: roomId } } });
    await prisma.booking.deleteMany({ where: { resourceId: roomId } });
    await prisma.availability.deleteMany({ where: { resourceId: roomId } });
    await prisma.room.delete({ where: { id: roomId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  function token() {
    return jwtService.sign(
      { sub: userId, role: UserRole.CUSTOMER },
      { secret: config.get<string>('jwt.secret'), expiresIn: '15m' },
    );
  }

  it('ne laisse passer qu\'une seule réservation quand deux requêtes concurrentes ciblent la même chambre/dates', async () => {
    const payload = {
      resourceType: 'ROOM',
      resourceId: roomId,
      startDate: '2026-12-20',
      endDate: '2026-12-23',
      paymentType: 'FULL',
    };
    const authToken = token();

    const [responseA, responseB] = await Promise.all([
      request(app.getHttpServer()).post('/api/v1/bookings').set('Authorization', `Bearer ${authToken}`).send(payload),
      request(app.getHttpServer()).post('/api/v1/bookings').set('Authorization', `Bearer ${authToken}`).send(payload),
    ]);

    const statuses = [responseA.status, responseB.status].sort();
    expect(statuses).toEqual([201, 409]);

    const bookingsForRoom = await prisma.booking.findMany({ where: { resourceId: roomId } });
    expect(bookingsForRoom).toHaveLength(1);

    const bookedSlots = await prisma.availability.findMany({
      where: { resourceId: roomId, date: { gte: new Date('2026-12-20'), lt: new Date('2026-12-23') } },
    });
    expect(bookedSlots).toHaveLength(3);
    expect(bookedSlots.every((slot) => slot.status === 'BOOKED')).toBe(true);
  });

  it('accepte une nouvelle réservation sur des dates différentes (pas de chevauchement)', async () => {
    const authToken = token();
    const response = await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        resourceType: 'ROOM',
        resourceId: roomId,
        startDate: '2027-01-05',
        endDate: '2027-01-07',
        paymentType: 'DEPOSIT',
      });

    expect(response.status).toBe(201);
    expect(Number(response.body.depositAmount)).toBeLessThan(Number(response.body.totalAmount));
  });
});
