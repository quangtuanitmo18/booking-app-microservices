import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlightService } from './flight.service';
import { FlightController } from './flight.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [FlightController],
  providers: [FlightService],
})
export class FlightModule {}
