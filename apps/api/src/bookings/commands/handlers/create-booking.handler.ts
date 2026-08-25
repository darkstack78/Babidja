import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../impl/create-booking.command';
import { BookingsService } from '../../bookings.service';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(private readonly bookingsService: BookingsService) {}

  async execute(command: CreateBookingCommand) {
    // We delegate to the existing service method to avoid breaking the complex transaction logic
    // In a pure CQRS setup, the logic would be fully moved here.
    return this.bookingsService.createBooking(command.dto, command.userId);
  }
}
