import { Controller, Get, Param, Query } from '@nestjs/common';
import { ResourceType } from '@prisma/client';
import { VehiclesService } from './vehicles.service';
import { ListVehiclesDto } from './dto/list-vehicles.dto';
import { AvailabilityService } from '../availability/availability.service';
import { DateRangeQueryDto, resolveDateRange } from '../common/dto/date-range-query.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get()
  findAll(@Query() query: ListVehiclesDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Get(':id/availability')
  async availability(@Param('id') id: string, @Query() query: DateRangeQueryDto) {
    await this.vehiclesService.findOne(id); // 404 si le véhicule n'existe pas
    const { start, end } = resolveDateRange(query);
    return this.availabilityService.findRange(ResourceType.VEHICLE, id, start, end);
  }
}
