import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserBookingsQuery } from '../impl/get-user-bookings.query';
import { BookingsService } from '../../bookings.service';

@QueryHandler(GetUserBookingsQuery)
export class GetUserBookingsHandler implements IQueryHandler<GetUserBookingsQuery> {
  constructor(private readonly bookingsService: BookingsService) {}

  async execute(query: GetUserBookingsQuery) {
    return this.bookingsService.findUserBookings(query.userId);
  }
}
