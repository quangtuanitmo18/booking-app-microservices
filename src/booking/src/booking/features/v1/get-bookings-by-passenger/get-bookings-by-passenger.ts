import Joi from 'joi';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'building-blocks/passport/jwt.guard';
import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { BookingDto } from '@/booking/dtos/booking.dto';
import { IBookingRepository } from '@/data/repositories/booking.repository';
import { Booking } from '@/booking/entities/booking.entity';
import mapper from '@/booking/mappings';

export class GetBookingsByPassenger {
  passengerId: number;

  constructor(request: Partial<GetBookingsByPassenger> = {}) {
    Object.assign(this, request);
  }
}

const getBookingsByPassengerValidations = {
  params: Joi.object().keys({
    passengerId: Joi.number().integer().required()
  })
};

@ApiBearerAuth()
@ApiTags('Bookings')
@Controller({
  path: `/booking`,
  version: '1'
})
export class GetBookingsByPassengerController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('passenger')
  @UseGuards(JwtGuard)
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN' })
  public async getBookingsByPassenger(
    @Query('passengerId') passengerId: number
  ): Promise<BookingDto[]> {
    const result = await this.queryBus.execute(
      new GetBookingsByPassenger({
        passengerId: passengerId
      })
    );

    return result;
  }
}

@QueryHandler(GetBookingsByPassenger)
export class GetBookingsByPassengerHandler implements IQueryHandler<GetBookingsByPassenger> {
  constructor(
    @Inject('IBookingRepository') private readonly bookingRepository: IBookingRepository
  ) {}

  async execute(query: GetBookingsByPassenger): Promise<BookingDto[]> {
    await getBookingsByPassengerValidations.params.validateAsync(query);

    const bookingEntities = await this.bookingRepository.getBookingsByPassengerId(query.passengerId);

    const result = bookingEntities.map(entity =>
      mapper.map<Booking, BookingDto>(entity, new BookingDto())
    );

    return result;
  }
}
