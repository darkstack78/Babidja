import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { EmailService } from './email.service';
import { NOTIFICATIONS_QUEUE } from './notifications.constants';

type NotificationJobData =
  | { kind: 'otp-sms'; phone: string; code: string }
  | { kind: 'booking-confirmed-sms'; phone: string; bookingRef: string }
  | { kind: 'verification-email'; email: string; token: string }
  | { kind: 'push'; fcmToken: string | null; title: string; body: string };

/**
 * Consomme la file 'notifications' plutôt que d'envoyer SMS/push/email de façon
 * synchrone dans la requête HTTP (section 8 du document technique backend) : la
 * latence d'un fournisseur externe ne bloque plus la réponse API.
 */
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly sms: SmsService,
    private readonly push: PushService,
    private readonly email: EmailService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const data = job.data;
    switch (data.kind) {
      case 'otp-sms':
        return this.sms.sendOtpSms(data.phone, data.code);
      case 'booking-confirmed-sms':
        return this.sms.sendBookingConfirmedSms(data.phone, data.bookingRef);
      case 'verification-email':
        return this.email.sendVerificationEmail(data.email, data.token);
      case 'push':
        return this.push.sendPush(data.fcmToken, data.title, data.body);
      default:
        this.logger.warn(`Job de notification de type inconnu ignoré: ${JSON.stringify(data)}`);
    }
  }
}
