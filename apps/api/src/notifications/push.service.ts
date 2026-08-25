import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private readonly config: ConfigService) {}

  async sendPush(fcmToken: string | null, title: string, body: string): Promise<void> {
    const projectId = this.config.get<string>('firebase.projectId');
    if (!fcmToken || !projectId || projectId.startsWith('<')) {
      this.logger.warn(`[DEV] Push "${title}" (${body}) non envoyée — Firebase non configuré`);
      return;
    }
    // TODO: intégrer firebase-admin une fois les credentials fournis (section 8 du document technique).
    throw new Error('Firebase Admin non initialisé — voir FIREBASE_* dans .env');
  }
}
