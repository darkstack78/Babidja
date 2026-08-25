import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Test explicitement demandé section 4.4 du document technique backend :
 * un token valide mais du mauvais tenant doit être rejeté avec un 403.
 * C'est la protection la plus critique du projet contre les fuites de
 * données entre établissements — nécessite Postgres actif (docker compose up).
 */
describe('TenantScopeGuard (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let config: ConfigService;

  let tenantAId: string;
  let tenantBId: string;
  let employeeUserId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    config = app.get(ConfigService);

    const tenantA = await prisma.tenant.create({
      data: { name: 'Hôtel A', type: 'HOTEL', address: 'Abidjan', city: 'Abidjan' },
    });
    const tenantB = await prisma.tenant.create({
      data: { name: 'Hôtel B', type: 'HOTEL', address: 'Bouaké', city: 'Bouaké' },
    });
    tenantAId = tenantA.id;
    tenantBId = tenantB.id;

    const user = await prisma.user.create({
      data: { firstName: 'Employé', lastName: 'Test', role: UserRole.TENANT_EMPLOYEE, referralCode: 'E2ETEST1' },
    });
    employeeUserId = user.id;
    await prisma.tenantEmployee.create({
      data: { tenantId: tenantAId, userId: employeeUserId, role: UserRole.TENANT_EMPLOYEE, permissions: [] },
    });
  });

  afterAll(async () => {
    await prisma.tenantEmployee.deleteMany({ where: { userId: employeeUserId } });
    await prisma.user.delete({ where: { id: employeeUserId } });
    await prisma.tenant.delete({ where: { id: tenantAId } });
    await prisma.tenant.delete({ where: { id: tenantBId } });
    await app.close();
  });

  function tokenFor(tenantId: string) {
    return jwtService.sign(
      { sub: employeeUserId, role: UserRole.TENANT_EMPLOYEE, tenantId },
      { secret: config.get<string>('jwt.secret'), expiresIn: '15m' },
    );
  }

  it('refuse (403) un token valide mais avec le mauvais tenantId dans l\'URL', async () => {
    const token = tokenFor(tenantAId); // le token affirme appartenir au tenant A
    await request(app.getHttpServer())
      .get(`/api/v1/tenant/${tenantBId}/dashboard`) // mais on cible le tenant B
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('laisse passer le guard pour le bon tenant (pas de 403)', async () => {
    const token = tokenFor(tenantAId);
    const response = await request(app.getHttpServer())
      .get(`/api/v1/tenant/${tenantAId}/dashboard`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).not.toBe(403);
  });

  it('refuse (401) sans token du tout', async () => {
    await request(app.getHttpServer()).get(`/api/v1/tenant/${tenantAId}/dashboard`).expect(401);
  });
});
