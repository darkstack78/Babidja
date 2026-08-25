import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.config.get<string>('frontendUrl');
    const link = `${frontendUrl}/verify-email?token=${token}`;

    // Aucun provider email réel n'est branché (SMTP/SES/Resend à choisir plus
    // tard) — fallback dev : on log le lien au lieu de l'envoyer.
    if (this.config.get<string>('nodeEnv') === 'production') {
      this.logger.error(
        `Aucun provider email configuré en production — lien de vérification non envoyé à ${email}`,
      );
      return;
    }
    this.logger.warn(`[DEV] Lien de vérification pour ${email} : ${link}`);
  }
}
