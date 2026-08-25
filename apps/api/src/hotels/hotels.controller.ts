import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { RoomsService } from './rooms.service';
import { ListHotelsDto } from './dto/list-hotels.dto';
import { DateRangeQueryDto, resolveDateRange } from '../common/dto/date-range-query.dto';

@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly roomsService: RoomsService,
  ) {}

  @Get()
  findAll(@Query() query: ListHotelsDto) {
    return this.hotelsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelsService.findOne(id);
  }

  @Get(':id/rooms')
  rooms(@Param('id') id: string) {
    return this.roomsService.findByTenant(id);
  }

  @Get(':id/availability')
  availability(@Param('id') id: string, @Query() query: DateRangeQueryDto) {
    const { start, end } = resolveDateRange(query);
    return this.hotelsService.availability(id, start, end);
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string, @Query('page') page?: string) {
    return this.hotelsService.reviews(id, page ? Number(page) : 1);
  }
}
