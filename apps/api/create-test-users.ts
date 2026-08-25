import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateReferralCode() {
  return randomBytes(4).toString('hex').toUpperCase();
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  // Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@babydja.com' },
    update: { passwordHash, role: UserRole.SUPER_ADMIN },
    create: {
      email: 'admin@babydja.com',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      isEmailVerified: true,
      referralCode: generateReferralCode()
    }
  });

  // Hotel Admin
  const hotelUser = await prisma.user.upsert({
    where: { email: 'hotel@babydja.ci' },
    update: { passwordHash, role: UserRole.TENANT_ADMIN },
    create: {
      email: 'hotel@babydja.ci',
      passwordHash,
      role: UserRole.TENANT_ADMIN,
      firstName: 'Admin',
      lastName: 'Hotel',
      isEmailVerified: true,
      referralCode: generateReferralCode()
    }
  });

  // Link to hotel tenant
  const hotelTenant = await prisma.tenant.findUnique({ where: { id: 'hotel-babydja' } });
  if (hotelTenant) {
    const existingEmp = await prisma.tenantEmployee.findFirst({ where: { tenantId: hotelTenant.id, userId: hotelUser.id }});
    if (!existingEmp) {
      await prisma.tenantEmployee.create({ data: { tenantId: hotelTenant.id, userId: hotelUser.id, role: UserRole.TENANT_ADMIN }});
    }
  }

  // Auto Admin
  const autoUser = await prisma.user.upsert({
    where: { email: 'auto@babydja.ci' },
    update: { passwordHash, role: UserRole.TENANT_ADMIN },
    create: {
      email: 'auto@babydja.ci',
      passwordHash,
      role: UserRole.TENANT_ADMIN,
      firstName: 'Admin',
      lastName: 'Auto',
      isEmailVerified: true,
      referralCode: generateReferralCode()
    }
  });

  // Link to auto tenant
  const autoTenant = await prisma.tenant.findUnique({ where: { id: 'babydja-auto' } });
  if (autoTenant) {
    const existingEmp = await prisma.tenantEmployee.findFirst({ where: { tenantId: autoTenant.id, userId: autoUser.id }});
    if (!existingEmp) {
      await prisma.tenantEmployee.create({ data: { tenantId: autoTenant.id, userId: autoUser.id, role: UserRole.TENANT_ADMIN }});
    }
  }

  console.log("Users created/updated successfully.");
}

main().finally(() => prisma.$disconnect());
