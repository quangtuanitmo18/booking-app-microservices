import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import type { Request } from 'express';
import { COOKIE_ACCESS_TOKEN } from '../shared/constants';

@Controller('passengers')
export class PassengerController {
  constructor(private readonly passengerService: PassengerService) {}

  @Get('me')
  async getPassengerByMe(@Req() req: Request) {
    const token = req.cookies?.[COOKIE_ACCESS_TOKEN];
    if (!token) {
      throw new UnauthorizedException('Authentication cookie missing');
    }
    return this.passengerService.getPassengerByMe(token);
  }
}
