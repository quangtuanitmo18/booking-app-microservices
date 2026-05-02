import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
