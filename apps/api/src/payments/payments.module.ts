import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './webhook.controller';
import { PaymentsService } from './payments.service';
import { CinetPayClient } from './cinetpay.client';
import { ReconcilePaymentsService } from './jobs/reconcile-payments.service';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [BookingsModule, NotificationsModule],
  controllers: [PaymentsController, WebhookController],
  // BACK-02 : ReconcilePaymentsService contient le job cron de r\u00e9conciliation PENDING
  providers: [PaymentsService, CinetPayClient, ReconcilePaymentsService],
  exports: [PaymentsService, CinetPayClient],
})
export class PaymentsModule {}

