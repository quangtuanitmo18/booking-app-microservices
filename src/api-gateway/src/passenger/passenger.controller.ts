import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { PassengerService } from './passenger.service';
import type { Request } from 'express';

@Controller('passengers')
export class PassengerController {
  constructor(private readonly passengerService: PassengerService) {}

  @Get('me')
  async getPassengerByMe(@Req() req: Request) {
    const token = req.cookies?.Authentication;
    if (!token) {
      throw new UnauthorizedException('Authentication cookie missing');
    }
    return this.passengerService.getPassengerByMe(token);
  }
}
