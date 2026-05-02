import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FlightModule } from './flight/flight.module';
import { BookingModule } from './booking/booking.module';
import { PassengerModule } from './passenger/passenger.module';

@Module({
  imports: [AuthModule, FlightModule, BookingModule, PassengerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
