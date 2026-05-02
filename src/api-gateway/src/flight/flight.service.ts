import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlightService {
  private readonly flightServiceUrl = process.env.FLIGHT_SERVICE_URL || 'http://localhost:3344';

  constructor(private readonly httpService: HttpService) {}

  async getFlights(token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.flightServiceUrl}/api/v1/flight/list`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Flight service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getFlightById(id: number, token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.flightServiceUrl}/api/v1/flight/get-by-id`, {
          params: { id },
          headers,
        }),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Flight service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getAvailableSeats(flightId: number, token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.flightServiceUrl}/api/v1/seat/get-available-seats`, {
          params: { flightId },
          headers,
        }),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Flight service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async reserveSeat(seatNumber: string, flightId: number, token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.flightServiceUrl}/api/v1/seat/reserve`,
          { seatNumber, flightId },
          { headers },
        ),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Flight service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
