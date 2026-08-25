import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBookingCommand } from './commands/impl/create-booking.command';
import { GetUserBookingsQuery } from './queries/impl/get-user-bookings.query';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthenticatedUser) {
    return this.commandBus.execute(new CreateBookingCommand(dto, user.userId));
  }

  @Get('my-bookings')
  myBookings(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetUserBookingsQuery(user.userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.findOne(id, user.userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.cancel(id, user.userId, dto.reason);
  }

  @Post(':id/review')
  review(
    @Param('id') id: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.createReview(id, user.userId, dto.rating, dto.comment);
  }
}
