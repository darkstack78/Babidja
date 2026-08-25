// @ts-nocheck
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateReferral() {
  return randomBytes(4).toString('hex').toUpperCase();
}

async function main() {
  const passwordHash = await bcrypt.hash('babydja2026', 12);
  
  // Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@babydja.ci' },
    update: {},
    create: {
      email: 'admin@babydja.ci',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      referralCode: generateReferral()
    }
  });

  // Hotel Manager
  const hotelUser = await prisma.user.upsert({
    where: { email: 'hotel@babydja.ci' },
    update: {},
    create: {
      email: 'hotel@babydja.ci',
      firstName: 'Gérant',
      lastName: 'Hôtel',
      passwordHash,
      role: UserRole.TENANT_ADMIN,
      isEmailVerified: true,
      referralCode: generateReferral()
    }
  });

  // Assign to hotel
  const hotelTenant = await prisma.tenant.findUnique({ where: { id: 'hotel-babydja' } });
  if (hotelTenant) {
    const existingEmp = await prisma.tenantEmployee.findFirst({ where: { userId: hotelUser.id, tenantId: 'hotel-babydja' } });
    if (!existingEmp) {
      await prisma.tenantEmployee.create({
        data: {
          userId: hotelUser.id,
          tenantId: 'hotel-babydja',
          role: UserRole.TENANT_ADMIN,
        }
      });
    }
  }

  // Car Manager
  const carUser = await prisma.user.upsert({
    where: { email: 'auto@babydja.ci' },
    update: {},
    create: {
      email: 'auto@babydja.ci',
      firstName: 'Gérant',
      lastName: 'Auto',
      passwordHash,
      role: UserRole.TENANT_ADMIN,
      isEmailVerified: true,
      referralCode: generateReferral()
    }
  });

  // Assign to auto
  const autoTenant = await prisma.tenant.findUnique({ where: { id: 'babydja-auto' } });
  if (autoTenant) {
    const existingEmp = await prisma.tenantEmployee.findFirst({ where: { userId: carUser.id, tenantId: 'babydja-auto' } });
    if (!existingEmp) {
      await prisma.tenantEmployee.create({
        data: {
          userId: carUser.id,
          tenantId: 'babydja-auto',
          role: UserRole.TENANT_ADMIN,
        }
      });
    }
  }

  console.log("Comptes d'administration créés avec succès !");
}

main().finally(async () => {
  await prisma.$disconnect();
});
