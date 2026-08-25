import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TenantScopeGuard } from '../auth/guards/tenant-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DateRangeQueryDto, resolveDateRange } from '../common/dto/date-range-query.dto';
import { TenantsService } from './tenants.service';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CatalogueItemDto } from './dto/catalogue-item.dto';

/**
 * Toutes les routes ci-dessous sont sous /tenant/:tenantId/* et protégées par
 * TenantScopeGuard — voir section 4.4 du document technique backend : c'est la
 * protection la plus critique du projet contre les fuites de données entre
 * établissements. Ne jamais retirer ce guard sur une route de ce contrôleur.
 */
@UseGuards(JwtAuthGuard, RolesGuard, TenantScopeGuard)
@Controller('tenant/:tenantId')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE)
  @Get('dashboard')
  dashboard(@Param('tenantId') tenantId: string) {
    return this.tenantsService.dashboard(tenantId);
  }

  @Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE)
  @Get('bookings')
  listBookings(@Param('tenantId') tenantId: string) {
    return this.tenantsService.listBookings(tenantId);
  }

  @Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE)
  @Patch('bookings/:bookingId')
  updateBooking(
    @Param('tenantId') tenantId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.tenantsService.updateBookingStatus(tenantId, bookingId, dto.status);
  }

  @Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE)
  @Get('availability')
  getAvailability(@Param('tenantId') tenantId: string, @Query() query: DateRangeQueryDto) {
    const { start, end } = resolveDateRange(query);
    return this.tenantsService.getAvailability(tenantId, start, end);
  }

  @Roles(UserRole.TENANT_ADMIN, UserRole.TENANT_EMPLOYEE)
  @Put('availability')
  updateAvailability(@Param('tenantId') tenantId: string, @Body() dto: UpdateAvailabilityDto) {
    return this.tenantsService.updateAvailability(tenantId, dto);
  }

  @Roles(UserRole.TENANT_ADMIN)
  @Get('catalogue')
  listCatalogue(@Param('tenantId') tenantId: string) {
    return this.tenantsService.listCatalogue(tenantId);
  }

  @Roles(UserRole.TENANT_ADMIN)
  @Post('catalogue')
  createCatalogueItem(@Param('tenantId') tenantId: string, @Body() dto: CatalogueItemDto) {
    return this.tenantsService.createCatalogueItem(tenantId, dto);
  }

  @Roles(UserRole.TENANT_ADMIN)
  @Patch('catalogue/:itemId')
  updateCatalogueItem(
    @Param('tenantId') tenantId: string,
    @Param('itemId') itemId: string,
    @Body() dto: CatalogueItemDto,
  ) {
    return this.tenantsService.updateCatalogueItem(tenantId, itemId, dto);
  }
}
