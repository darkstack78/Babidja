import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { ReferralModule } from '../referral/referral.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [BookingsModule, ReferralModule, StorageModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
