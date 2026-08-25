import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReferralRewardStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 5.3 : à l'inscription d'un filleul avec un code de parrainage valide, crée une
   * entrée Referral avec rewardStatus=PENDING. Ne doit jamais faire échouer
   * l'inscription elle-même : un code invalide, un auto-parrainage, ou un montant
   * de récompense pas encore configuré (REFERRAL_REWARD_AMOUNT) sont tous
   * silencieusement ignorés (avec un warning loggé dans ce dernier cas).
   */
  async registerReferral(referrerCode: string | undefined | null, referredId: string): Promise<void> {
    if (!referrerCode) return;

    const referrer = await this.prisma.user.findUnique({ where: { referralCode: referrerCode } });
    if (!referrer || referrer.id === referredId) return;

    const rewardAmount = this.resolveRewardAmount();
    if (rewardAmount === null) {
      this.logger.warn(
        'REFERRAL_REWARD_AMOUNT non configuré : parrainage non enregistré pour cette inscription.',
      );
      return;
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: referredId }, data: { referredById: referrer.id } }),
      this.prisma.referral.create({
        data: { referrerId: referrer.id, referredId, rewardAmount, rewardStatus: ReferralRewardStatus.PENDING },
      }),
    ]);
  }

  /**
   * Le crédit effectif se déclenche à la première réservation CONFIRMED du filleul
   * (appelé depuis BookingsService.confirm). Le montant crédité est celui figé sur
   * la ligne Referral à l'inscription (pas la config courante) — et le garde
   * `rewardStatus === PENDING` rend l'appel naturellement idempotent : une
   * confirmation ultérieure du même filleul ne recrédite jamais une seconde fois.
   */
  async creditReward(referredId: string): Promise<void> {
    const referral = await this.prisma.referral.findUnique({ where: { referredId } });
    if (!referral || referral.rewardStatus !== ReferralRewardStatus.PENDING) return;

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: referral.referrerId },
        data: { walletBalance: { increment: referral.rewardAmount } },
      }),
      this.prisma.referral.update({
        where: { id: referral.id },
        data: { rewardStatus: ReferralRewardStatus.CREDITED },
      }),
    ]);
  }

  findByUser(userId: string) {
    return this.prisma.referral.findMany({ where: { referrerId: userId }, orderBy: { createdAt: 'desc' } });
  }

  private resolveRewardAmount(): number | null {
    const raw = this.config.get<string>('referral.rewardAmount');
    const amount = Number(raw);
    if (!raw || Number.isNaN(amount) || amount <= 0) return null;
    return amount;
  }
}
