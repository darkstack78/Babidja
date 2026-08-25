import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';

export interface InitiatePaymentParams {
  transactionId: string;
  amount: number;
  customerName: string;
  channels?: string;
}

@Injectable()
export class CinetPayClient {
  private readonly logger = new Logger(CinetPayClient.name);

  constructor(private readonly config: ConfigService) {}

  async initiatePayment(params: InitiatePaymentParams): Promise<{ paymentUrl: string }> {
    const apiKey = this.config.get<string>('cinetpay.apiKey');
    if (!apiKey || apiKey.startsWith('<')) {
      // 503 explicite plutôt qu'un 500 opaque : le frontend peut afficher un
      // message clair tant que les vraies clés CinetPay ne sont pas fournies.
      throw new ServiceUnavailableException(
        "Le paiement en ligne n'est pas encore configuré. Réessayez plus tard.",
      );
    }

    const { data } = await axios.post('https://api-checkout.cinetpay.com/v2/payment', {
      apikey: apiKey,
      site_id: this.config.get<string>('cinetpay.siteId'),
      transaction_id: params.transactionId,
      amount: params.amount,
      currency: 'XOF',
      description: 'Réservation Babydja',
      customer_name: params.customerName,
      notify_url: this.config.get<string>('cinetpay.notifyUrl'),
      return_url: this.config.get<string>('cinetpay.returnUrl'),
      channels: params.channels ?? 'ALL',
    });

    return { paymentUrl: data.data.payment_url };
  }

  /**
   * Vérification de signature webhook (section 7.2 du document technique).
   * ⚠ Le nom exact du header et l'algorithme doivent être confirmés dans la
   * documentation CinetPay au moment de l'implémentation réelle — squelette à adapter.
   */
  verifySignature(body: unknown, headers: Record<string, string | string[] | undefined>): boolean {
    const secret = this.config.get<string>('cinetpay.webhookSecret');
    const token = headers['x-token'];
    if (!secret || secret.startsWith('<') || !token || Array.isArray(token)) {
      this.logger.warn('CINETPAY_WEBHOOK_SECRET manquant ou header de signature absent');
      return false;
    }
    const computed = createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    // CRIT-02 : Comparaison timing-safe pour pr\u00e9venir les attaques temporelles
    // sur la signature HMAC. La comparaison === r\u00e9v\u00e8le la longueur du secret via timing.
    const a = Buffer.from(computed, 'utf8');
    const b = Buffer.from(Array.isArray(token) ? token[0] : token, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
