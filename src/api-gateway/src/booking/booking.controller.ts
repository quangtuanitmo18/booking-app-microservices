import { Controller, Post, Get, Put, Body, Req, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const token = req.cookies?.['access_token'];
    return this.bookingService.createBooking(dto, token);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'User bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyBookings(@Req() req: Request) {
    const token = req.cookies?.['access_token'];
    return this.bookingService.getMyBookings(token);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelBooking(@Param('id') id: string, @Req() req: Request) {
    const token = req.cookies?.['access_token'];
    return this.bookingService.cancelBooking(id, token);
  }
}
