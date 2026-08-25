import { Body, Controller, Headers, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { CinetPayClient } from './cinetpay.client';
import { PaymentsService } from './payments.service';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CinetPayWebhookDto } from './dto/cinetpay-webhook.dto';

@Controller('payments')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly cinetpayClient: CinetPayClient,
    private readonly paymentsService: PaymentsService,
    private readonly bookingsService: BookingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * ⚠ Toujours répondre HTTP 200 à CinetPay, même en cas d'erreur de traitement
   * interne — sinon CinetPay retente indéfiniment et peut créer des traitements
   * dupliqués (section 5.2 du document technique backend). Les erreurs internes
   * sont journalisées, jamais renvoyées au client.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: CinetPayWebhookDto, @Headers() headers: Record<string, string>) {
    try {
      const isValid = this.cinetpayClient.verifySignature(body, headers);
      if (!isValid) {
        this.logger.warn('Webhook CinetPay ignoré : signature invalide');
        return { status: 'ignored' };
      }

      const payment = await this.paymentsService.findByProviderTxId(body.transaction_id);
      if (!payment) {
        this.logger.error(`Webhook CinetPay : transaction inconnue ${body.transaction_id}`);
        return { status: 'ignored' };
      }

      // Idempotence : CinetPay retente le webhook tant qu'il ne reçoit pas 200 (voir
      // commentaire ci-dessus). Sans ce garde, une retentative après traitement réussi
      // reconfirme la réservation et renvoie un second SMS de confirmation au client.
      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.log(`Webhook CinetPay ignoré : paiement ${payment.id} déjà traité (${payment.status})`);
        return { status: 'ok' };
      }

      if (body.status === 'ACCEPTED') {
        await this.paymentsService.markSuccess(payment.id);
        const booking = await this.bookingsService.confirm(payment.bookingId);
        if (booking.user.phone) {
          await this.notificationsService.sendBookingConfirmedSms(booking.user.phone, booking.bookingRef);
        }
      } else {
        await this.paymentsService.markFailed(payment.id);
      }

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Erreur de traitement du webhook CinetPay', error instanceof Error ? error.stack : String(error));
      // TODO: alerte séparée + job de réconciliation pour les paiements PENDING (section 7.3).
      return { status: 'ok' };
    }
  }
}
