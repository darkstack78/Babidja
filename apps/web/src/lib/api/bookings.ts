import http from '../http';
import type { Booking, CreateBookingPayload } from '@/types/booking';

export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
  const { data } = await http.post('/bookings', payload);
  return data;
};

export const fetchMyBookings = async (): Promise<Booking[]> => {
  const { data } = await http.get('/bookings/my-bookings');
  return data;
};
