import http from '../http';

export type PaymentMethodCode = 'MTN' | 'ORANGE' | 'MOOV' | 'WAVE' | 'CARD';

export const initiatePayment = async (
  bookingId: string,
  method: PaymentMethodCode,
): Promise<{ paymentUrl: string }> => {
  const { data } = await http.post('/payments/initiate', { bookingId, method });
  return data;
};
