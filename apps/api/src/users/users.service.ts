import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, Prisma, User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const REFERRAL_CODE_MAX_ATTEMPTS = 5;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(
    data: Omit<Prisma.UserCreateInput, 'referralCode'> & { referralCode?: string },
  ): Promise<User> {
    if (data.referralCode) {
      return this.prisma.user.create({ data: { ...data, referralCode: data.referralCode } });
    }

    // referralCode est aléatoire (8 caractères hexadécimaux) : la collision est rare
    // mais pas impossible, on retente avec un nouveau code plutôt que de laisser
    // remonter une erreur de contrainte unique brute.
    for (let attempt = 1; attempt <= REFERRAL_CODE_MAX_ATTEMPTS; attempt++) {
      try {
        return await this.prisma.user.create({
          data: { ...data, referralCode: this.generateReferralCode() },
        });
      } catch (error) {
        const isReferralCodeCollision =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          (error.meta?.target as string[] | undefined)?.includes('referralCode');
        if (!isReferralCodeCollision || attempt === REFERRAL_CODE_MAX_ATTEMPTS) {
          throw error;
        }
      }
    }
    throw new Error('Impossible de générer un code de parrainage unique.');
  }

  setRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash } });
  }

  update(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  private generateReferralCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  listPaymentMethods(userId: string) {
    return this.prisma.savedPaymentMethod.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  addPaymentMethod(
    userId: string,
    data: { provider: PaymentMethod; tokenizedRef: string; label?: string },
  ) {
    return this.prisma.savedPaymentMethod.create({ data: { userId, ...data } });
  }

  async removePaymentMethod(userId: string, id: string): Promise<{ success: true }> {
    const method = await this.prisma.savedPaymentMethod.findUnique({ where: { id } });
    // Scopé par userId (pas juste par id) : même logique que les IDOR corrigés sur
    // bookings/payments/messaging — un utilisateur ne doit jamais pouvoir supprimer
    // le moyen de paiement d'un autre en devinant son id.
    if (!method || method.userId !== userId) {
      throw new NotFoundException('Moyen de paiement introuvable.');
    }
    await this.prisma.savedPaymentMethod.delete({ where: { id } });
    return { success: true };
  }
}
