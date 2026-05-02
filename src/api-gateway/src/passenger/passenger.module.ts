import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassengerController } from './passenger.controller';
import { PassengerService } from './passenger.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PassengerController],
  providers: [PassengerService],
})
export class PassengerModule {}
