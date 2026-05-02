import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PassengerService {
  private readonly passengerServiceUrl = process.env.PASSENGER_SERVICE_URL || 'http://localhost:3355';

  constructor(private readonly httpService: HttpService) {}

  async getPassengerByMe(token?: string): Promise<any> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response: any = await firstValueFrom(
        this.httpService.get(`${this.passengerServiceUrl}/api/v1/passenger/me`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Passenger service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
