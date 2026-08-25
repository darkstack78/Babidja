import http from '../http';

export type PaymentMethodCode = 'MTN' | 'ORANGE' | 'MOOV' | 'WAVE' | 'CARD';

export const initiatePayment = async (
  bookingId: string,
  method: PaymentMethodCode,
): Promise<{ paymentUrl: string }> => {
  const { data } = await http.post('/payments/initiate', { bookingId, method });
  return data;
};

// ─── Moyens de paiement sauvegardés ─────────────────────────────────────────

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  provider: PaymentMethodCode;
  tokenizedRef: string;
  label: string | null;
  createdAt: string;
}

export interface CreateSavedPaymentMethodPayload {
  provider: PaymentMethodCode;
  tokenizedRef: string;
  label?: string;
}

/** Retourne la liste des moyens de paiement sauvegardés de l'utilisateur connecté. */
export const getSavedPaymentMethods = async (): Promise<SavedPaymentMethod[]> => {
  const { data } = await http.get('/payments/saved-methods');
  return data;
};

/** Ajoute un nouveau moyen de paiement sauvegardé. */
export const addSavedPaymentMethod = async (
  payload: CreateSavedPaymentMethodPayload,
): Promise<SavedPaymentMethod> => {
  const { data } = await http.post('/payments/saved-methods', payload);
  return data;
};

/** Supprime un moyen de paiement sauvegardé par son id. */
export const deleteSavedPaymentMethod = async (id: string): Promise<void> => {
  await http.delete(`/payments/saved-methods/${id}`);
};

