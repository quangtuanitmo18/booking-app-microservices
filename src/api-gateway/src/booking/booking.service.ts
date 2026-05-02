import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  private readonly bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3366';

  constructor(private readonly httpService: HttpService) {}

  async createBooking(dto: CreateBookingDto, token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response: any = await firstValueFrom(
        this.httpService.post(`${this.bookingServiceUrl}/api/v1/booking/create`, dto, { headers }),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Booking service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getMyBookings(token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 1. Get Passenger Profile
      const passengerServiceUrl = process.env.PASSENGER_SERVICE_URL || 'http://localhost:3355';
      const passengerResponse: any = await firstValueFrom(
        this.httpService.get(`${passengerServiceUrl}/api/v1/passenger/me`, { headers })
      );
      
      const passengerId = passengerResponse.data?.id;
      if (!passengerId) {
         throw new HttpException('Passenger profile not found', HttpStatus.NOT_FOUND);
      }

      // 2. Get Bookings
      const bookingsResponse: any = await firstValueFrom(
        this.httpService.get(`${this.bookingServiceUrl}/api/v1/booking/passenger?passengerId=${passengerId}`, { headers })
      );

      return bookingsResponse.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Booking service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async cancelBooking(id: string, token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 1. Get Passenger Profile to ensure ownership
      const passengerServiceUrl = process.env.PASSENGER_SERVICE_URL || 'http://localhost:3355';
      const passengerResponse: any = await firstValueFrom(
        this.httpService.get(`${passengerServiceUrl}/api/v1/passenger/me`, { headers })
      );
      
      const passengerId = passengerResponse.data?.id;
      if (!passengerId) {
         throw new HttpException('Passenger profile not found', HttpStatus.NOT_FOUND);
      }

      // 2. Cancel Booking
      const cancelResponse: any = await firstValueFrom(
        this.httpService.put(`${this.bookingServiceUrl}/api/v1/booking/${id}/cancel`, { passengerId }, { headers })
      );

      return cancelResponse.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Booking service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
