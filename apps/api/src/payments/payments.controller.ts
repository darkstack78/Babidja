import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  initiate(@Body() dto: InitiatePaymentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.initiate(dto.bookingId, dto.method, user.userId);
  }

  @Get(':bookingId')
  findByBooking(@Param('bookingId') bookingId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.findByBooking(bookingId, user.userId);
  }
}
