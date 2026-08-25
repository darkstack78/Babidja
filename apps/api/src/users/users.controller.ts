import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import { BookingStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddPaymentMethodDto } from './dto/add-payment-method.dto';
import { sanitizeUser } from './sanitize-user';
import { BookingsService } from '../bookings/bookings.service';
import { ReferralService } from '../referral/referral.service';

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly bookingsService: BookingsService,
    private readonly referralService: ReferralService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async me(@CurrentUser() user: AuthenticatedUser) {
    const [found, tenantId] = await Promise.all([
      this.usersService.findById(user.userId),
      this.usersService.findCurrentTenantId(user.userId),
    ]);
    return found && { ...sanitizeUser(found), tenantId };
  }

  @Patch()
  async updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.update(user.userId, dto);
    return sanitizeUser(updated);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const key = `avatars/${user.userId}-${Date.now()}-${file.originalname}`;
    const avatarUrl = await this.storageService.upload(key, file.buffer, file.mimetype);
    const updated = await this.usersService.update(user.userId, { avatarUrl });
    return sanitizeUser(updated);
  }

  @Get('bookings')
  myBookings(@CurrentUser() user: AuthenticatedUser, @Query('status') status?: BookingStatus) {
    return this.bookingsService.findUserBookings(user.userId, status);
  }

  @Get('wallet')
  async myWallet(@CurrentUser() user: AuthenticatedUser) {
    const found = await this.usersService.findById(user.userId);
    return { balance: found?.walletBalance ?? 0 };
  }

  @Get('referral')
  async myReferral(@CurrentUser() user: AuthenticatedUser) {
    const [found, referrals] = await Promise.all([
      this.usersService.findById(user.userId),
      this.referralService.findByUser(user.userId),
    ]);
    return { code: found?.referralCode ?? null, referrals };
  }

  @Get('payment-methods')
  listPaymentMethods(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listPaymentMethods(user.userId);
  }

  @Post('payment-methods')
  addPaymentMethod(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddPaymentMethodDto) {
    return this.usersService.addPaymentMethod(user.userId, dto);
  }

  @Delete('payment-methods/:id')
  removePaymentMethod(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.removePaymentMethod(user.userId, id);
  }
}
