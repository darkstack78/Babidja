import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSavedPaymentMethodDto } from '../dto/create-saved-payment-method.dto';

@Injectable()
export class SavedPaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Retourne tous les moyens de paiement sauvegardés de l'utilisateur. */
  findByUser(userId: string) {
    return this.prisma.savedPaymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Enregistre un nouveau moyen de paiement pour l'utilisateur. */
  create(userId: string, dto: CreateSavedPaymentMethodDto) {
    return this.prisma.savedPaymentMethod.create({
      data: {
        userId,
        provider: dto.provider,
        tokenizedRef: dto.tokenizedRef,
        label: dto.label ?? null,
      },
    });
  }

  /** Supprime un moyen de paiement en vérifiant l'ownership. */
  async remove(id: string, userId: string) {
    const method = await this.prisma.savedPaymentMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Moyen de paiement introuvable.');
    if (method.userId !== userId) {
      throw new ForbiddenException("Ce moyen de paiement ne vous appartient pas.");
    }
    return this.prisma.savedPaymentMethod.delete({ where: { id } });
  }
}
