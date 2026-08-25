export type BookingResourceType = 'ROOM' | 'VEHICLE';
export type PaymentType = 'FULL' | 'DEPOSIT';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  tenantId: string;
  resourceType: BookingResourceType;
  resourceId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  status: BookingStatus;
}

export interface CreateBookingPayload {
  resourceType: BookingResourceType;
  resourceId: string;
  startDate: string;
  endDate: string;
  paymentType: PaymentType;
  options?: Record<string, unknown>;
}
