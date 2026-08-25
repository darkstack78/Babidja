import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { SavedPaymentMethodsService } from './saved-payment-methods.service';
import { CreateSavedPaymentMethodDto } from '../dto/create-saved-payment-method.dto';

@UseGuards(JwtAuthGuard)
@Controller('payments/saved-methods')
export class SavedPaymentMethodsController {
  constructor(private readonly service: SavedPaymentMethodsService) {}

  /** GET /payments/saved-methods — liste les moyens sauvegardés de l'utilisateur connecté. */
  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findByUser(user.userId);
  }

  /** POST /payments/saved-methods — ajoute un nouveau moyen de paiement. */
  @Post()
  create(@Body() dto: CreateSavedPaymentMethodDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.userId, dto);
  }

  /** DELETE /payments/saved-methods/:id — supprime un moyen de paiement (ownership vérifié). */
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.userId);
  }
}
