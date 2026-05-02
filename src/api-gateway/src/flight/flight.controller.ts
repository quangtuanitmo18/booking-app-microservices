import { Controller, Get, Post, Query, Param, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { FlightService } from './flight.service';
import { ReserveSeatDto } from '../seat/dto/reserve-seat.dto';
import { COOKIE_ACCESS_TOKEN } from '../shared/constants';

@ApiTags('Flights')
@Controller('flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available flights' })
  @ApiResponse({ status: 200, description: 'List of flights' })
  async getFlights(@Req() req: Request) {
    const token = req.cookies?.[COOKIE_ACCESS_TOKEN];
    return this.flightService.getFlights(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight details by ID' })
  @ApiResponse({ status: 200, description: 'Flight details' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  async getFlightById(@Param('id') id: number, @Req() req: Request) {
    const token = req.cookies?.[COOKIE_ACCESS_TOKEN];
    return this.flightService.getFlightById(id, token);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get available seats for a flight' })
  @ApiResponse({ status: 200, description: 'Available seats' })
  async getAvailableSeats(@Param('id') id: number, @Req() req: Request) {
    const token = req.cookies?.[COOKIE_ACCESS_TOKEN];
    return this.flightService.getAvailableSeats(id, token);
  }

  @Post('seats/reserve')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reserve a seat' })
  @ApiResponse({ status: 204, description: 'Seat reserved' })
  @ApiResponse({ status: 404, description: 'Seat or flight not found' })
  async reserveSeat(@Body() dto: ReserveSeatDto, @Req() req: Request) {
    const token = req.cookies?.[COOKIE_ACCESS_TOKEN];
    return this.flightService.reserveSeat(dto.seatNumber, dto.flightId, token);
  }
}
