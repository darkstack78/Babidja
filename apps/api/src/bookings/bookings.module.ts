import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { ReferralModule } from '../referral/referral.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBookingHandler } from './commands/handlers/create-booking.handler';
import { GetUserBookingsHandler } from './queries/handlers/get-user-bookings.handler';

const CommandHandlers = [CreateBookingHandler];
const QueryHandlers = [GetUserBookingsHandler];

@Module({
  imports: [ReferralModule, CqrsModule],
  controllers: [BookingsController],
  providers: [BookingsService, ...CommandHandlers, ...QueryHandlers],
  exports: [BookingsService],
})
export class BookingsModule {}
