import { FlightDto } from '@/flight/dtos/flight.dto';
import { IFlightRepository } from '@/data/repositories/flightRepository';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Flight } from '@/flight/entities/flight.entity';
import { JwtGuard } from 'building-blocks/passport/jwt.guard';
import mapper from '@/flight/mappings';

export class GetFlights {
  constructor() {}
}

@ApiBearerAuth()
@ApiTags('Flights')
@Controller({
  path: `/flight`,
  version: '1'
})
export class GetFlightsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('list')
  @UseGuards(JwtGuard)
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 400, description: 'BAD_REQUEST' })
  @ApiResponse({ status: 200, description: 'OK' })
  public async getFlights(): Promise<FlightDto[]> {
    const result = await this.queryBus.execute(new GetFlights());
    return result;
  }
}

@QueryHandler(GetFlights)
export class GetFlightsHandler implements IQueryHandler<GetFlights> {
  constructor(
    @Inject('IFlightRepository') private readonly flightRepository: IFlightRepository
  ) {}

  async execute(): Promise<FlightDto[]> {
    const flightEntities = await this.flightRepository.getAll();

    return flightEntities.map((flight) =>
      mapper.map<Flight, FlightDto>(flight, new FlightDto())
    );
  }
}
