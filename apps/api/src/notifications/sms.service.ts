import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOtpSms(phone: string, code: string): Promise<void> {
    const apiKey = this.config.get<string>('sms.atApiKey');
    const isPlaceholder = !apiKey || apiKey.startsWith('<');

    if (isPlaceholder) {
      if (this.config.get<string>('nodeEnv') === 'production') {
        throw new Error('AT_API_KEY manquant en production : impossible d\'envoyer le SMS OTP');
      }
      // Fallback dev uniquement : pas de provider SMS configuré, on log au lieu d'envoyer.
      this.logger.warn(`[DEV] OTP pour ${phone} : ${code}`);
      return;
    }

    await axios.post('https://api.africastalking.com/version1/messaging', {
      username: this.config.get<string>('sms.atUsername'),
      to: phone,
      message: `Votre code Babydja : ${code}`,
      from: this.config.get<string>('sms.atSenderId'),
    }, {
      headers: { apiKey },
    });
  }

  async sendBookingConfirmedSms(phone: string, bookingRef: string): Promise<void> {
    const apiKey = this.config.get<string>('sms.atApiKey');
    if (!apiKey || apiKey.startsWith('<')) {
      this.logger.warn(`[DEV] SMS confirmation réservation ${bookingRef} pour ${phone}`);
      return;
    }
    await axios.post('https://api.africastalking.com/version1/messaging', {
      username: this.config.get<string>('sms.atUsername'),
      to: phone,
      message: `Votre réservation ${bookingRef} est confirmée. Merci de votre confiance !`,
      from: this.config.get<string>('sms.atSenderId'),
    }, {
      headers: { apiKey },
    });
  }
}
