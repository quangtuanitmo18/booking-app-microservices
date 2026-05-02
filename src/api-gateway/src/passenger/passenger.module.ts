import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassengerController } from './passenger.controller';
import { PassengerService } from './passenger.service';

@Module({
  imports: [HttpModule],
  controllers: [PassengerController],
  providers: [PassengerService],
})
export class PassengerModule {}
