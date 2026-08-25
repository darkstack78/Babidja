import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { ReferralModule } from '../referral/referral.module';

@Module({
  imports: [BookingsModule, ReferralModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
