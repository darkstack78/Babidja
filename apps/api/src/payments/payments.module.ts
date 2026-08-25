import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './webhook.controller';
import { PaymentsService } from './payments.service';
import { CinetPayClient } from './cinetpay.client';
import { ReconcilePaymentsService } from './jobs/reconcile-payments.service';
import { SavedPaymentMethodsController } from './saved-payment-methods/saved-payment-methods.controller';
import { SavedPaymentMethodsService } from './saved-payment-methods/saved-payment-methods.service';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [BookingsModule, NotificationsModule],
  controllers: [SavedPaymentMethodsController, PaymentsController, WebhookController],
  // BACK-02 : ReconcilePaymentsService contient le job cron de réconciliation PENDING
  providers: [PaymentsService, CinetPayClient, ReconcilePaymentsService, SavedPaymentMethodsService],
  exports: [PaymentsService, CinetPayClient],
})
export class PaymentsModule {}
