import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CinetPayClient } from '../cinetpay.client';
import { PaymentsService } from '../payments.service';
import { BookingsService } from '../../bookings/bookings.service';
import { NotificationsService } from '../../notifications/notifications.service';

// BACK-02 : Job de r\u00e9conciliation des paiements PENDING.
// Si le webhook CinetPay n'est pas livr\u00e9 (timeout r\u00e9seau, red\u00e9marrage serveur...),
// les paiements restent ind\u00e9finiment en statut PENDING. Ce job interroge l'API
// CinetPay toutes les 10 minutes pour les r\u00e9soudre.
const PENDING_TIMEOUT_MINUTES = 30; // Au-del\u00e0 de 30min PENDING, on r\u00e9concilie

@Injectable()
export class ReconcilePaymentsService {
  private readonly logger = new Logger(ReconcilePaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cinetPayClient: CinetPayClient,
    private readonly paymentsService: PaymentsService,
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * V\u00e9rifie le statut des paiements PENDING anciens via l'API CinetPay.
   * Tourn\u00e9 toutes les 10 minutes.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async reconcilePendingPayments() {
    const cutoff = new Date(Date.now() - PENDING_TIMEOUT_MINUTES * 60 * 1000);

    const stalePayments = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
        providerTxId: { not: null },
      },
      take: 50, // Traiter par batch pour \u00e9viter une surcharge
    });

    if (stalePayments.length === 0) return;

    this.logger.log(`R\u00e9conciliation : ${stalePayments.length} paiement(s) PENDING \u00e0 v\u00e9rifier`);

    for (const payment of stalePayments) {
      try {
        // NOTE : CinetPay fournit un endpoint GET /payment/check pour v\u00e9rifier le statut.
        // \u00c0 impl\u00e9menter dans CinetPayClient une fois les cl\u00e9s sandbox disponibles (section 7.3).
        // En attendant, on marque les paiements trop anciens comme \u00e9chou\u00e9s par s\u00e9curit\u00e9.
        this.logger.warn(
          `Paiement ${payment.id} (tx: ${payment.providerTxId}) PENDING depuis >${PENDING_TIMEOUT_MINUTES}min \u2014 marqu\u00e9 FAILED`,
        );
        await this.paymentsService.markFailed(payment.id);
      } catch (err) {
        this.logger.error(
          `\u00c9chec r\u00e9conciliation paiement ${payment.id}`,
          err instanceof Error ? err.stack : String(err),
        );
      }
    }
  }
}
