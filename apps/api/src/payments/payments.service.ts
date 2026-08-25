import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CinetPayClient } from './cinetpay.client';

// Codes de canal CinetPay par méthode — à confirmer/ajuster contre la
// documentation CinetPay au moment du branchement des vraies clés sandbox
// (le document technique ne donne pas les codes exacts, section 7.1).
const CHANNEL_BY_METHOD: Record<PaymentMethod, string> = {
  MTN: 'MOBILE_MONEY',
  ORANGE: 'MOBILE_MONEY',
  MOOV: 'MOBILE_MONEY',
  WAVE: 'MOBILE_MONEY',
  CARD: 'CREDIT_CARD',
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cinetpayClient: CinetPayClient,
  ) {}

  async initiate(bookingId: string, method: PaymentMethod, userId: string): Promise<{ paymentUrl: string }> {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { user: true } });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    if (booking.userId !== userId) {
      throw new ForbiddenException("Cette réservation ne vous appartient pas.");
    }
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Cette réservation ne peut plus être payée.');
    }

    const transactionId = `${booking.bookingRef}-${Date.now()}`;
    const customerName =
      `${booking.user.firstName} ${booking.user.lastName}`.trim() ||
      booking.user.email ||
      booking.user.phone ||
      'Client Babydja';

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,
        method,
        amount: booking.depositAmount,
        status: PaymentStatus.PENDING,
        providerTxId: transactionId,
      },
    });

    try {
      return await this.cinetpayClient.initiatePayment({
        transactionId,
        amount: Number(booking.depositAmount),
        customerName,
        channels: CHANNEL_BY_METHOD[method],
      });
    } catch (error) {
      await this.markFailed(payment.id);
      throw error;
    }
  }

  findByProviderTxId(providerTxId: string) {
    return this.prisma.payment.findUnique({ where: { providerTxId } });
  }

  markSuccess(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.SUCCESS },
    });
  }

  markFailed(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  async findByBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Cette réservation ne vous appartient pas.');
    }
    return this.prisma.payment.findFirst({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
