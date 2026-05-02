import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  async login(loginDto: LoginDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.identityServiceUrl}/api/v1/identity/login`, loginDto),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async register(registerDto: RegisterDto): Promise<any> {
    try {
      // Adding default role to register payload
      const payload = {
        ...registerDto,
        role: 'USER', 
      };
      // We assume /api/v1/user/create is the registration endpoint or can be used as such.
      // If it requires auth, we might need a bypass in Identity service or a dedicated public register endpoint.
      // For now, we will proxy to the existing create endpoint and see if it works.
      const response = await firstValueFrom(
        this.httpService.post(`${this.identityServiceUrl}/api/v1/user/create`, payload),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
