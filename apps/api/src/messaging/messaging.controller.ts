import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get(':bookingId')
  findByBooking(@Param('bookingId') bookingId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.findByBooking(bookingId, user.userId, user.tenantId);
  }

  @Post(':bookingId')
  create(
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const senderType = user.tenantId ? 'TENANT' : 'CUSTOMER';
    return this.messagingService.create(bookingId, user.userId, senderType, dto.content, user.tenantId);
  }
}
