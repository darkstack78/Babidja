import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { FindAvailabilityDto } from './dto/find-availability.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  find(@Query() query: FindAvailabilityDto) {
    return this.availabilityService.findRange(
      query.resourceType,
      query.resourceId,
      new Date(query.start),
      new Date(query.end),
    );
  }
}
