import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NOTIFICATIONS_QUEUE } from './notifications.constants';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue(NOTIFICATIONS_QUEUE) private readonly queue: Queue) {}

  async sendOtpSms(phone: string, code: string): Promise<void> {
    await this.queue.add('otp-sms', { kind: 'otp-sms', phone, code });
  }

  async sendBookingConfirmedSms(phone: string, bookingRef: string): Promise<void> {
    await this.queue.add('booking-confirmed-sms', { kind: 'booking-confirmed-sms', phone, bookingRef });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    await this.queue.add('verification-email', { kind: 'verification-email', email, token });
  }

  async notifyBookingConfirmed(fcmToken: string | null, bookingRef: string): Promise<void> {
    await this.queue.add('push', {
      kind: 'push',
      fcmToken,
      title: 'Réservation confirmée',
      body: `Votre réservation ${bookingRef} est confirmée.`,
    });
  }

  async notifyNewMessage(fcmToken: string | null): Promise<void> {
    await this.queue.add('push', {
      kind: 'push',
      fcmToken,
      title: 'Nouveau message',
      body: 'Vous avez reçu un nouveau message.',
    });
  }

  async notifyReferralRewardCredited(fcmToken: string | null): Promise<void> {
    await this.queue.add('push', {
      kind: 'push',
      fcmToken,
      title: 'Parrainage',
      body: 'Votre récompense de parrainage a été créditée.',
    });
  }
}
