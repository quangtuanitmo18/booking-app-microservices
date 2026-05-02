import { Inject, Logger } from '@nestjs/common';
import { ISeatRepository } from '@/data/repositories/seatRepository';
import { BookingCancelled } from 'building-blocks/contracts/booking.contract';

let _seatRepository: ISeatRepository;

export class CancelBookingConsumerHandler {
  constructor(@Inject('ISeatRepository') private readonly seatRepository: ISeatRepository) {
    _seatRepository = seatRepository;
  }

  async handle(queue: string, message: BookingCancelled): Promise<void> {
    if (!message) return;

    const seat = await _seatRepository.getSeatByFlightNumberAndSeatNumber(
      message.flightNumber,
      message.seatNumber
    );

    if (!seat) {
      Logger.warn(`Seat ${message.seatNumber} on flight ${message.flightNumber} not found.`);
      return;
    }

    if (!seat.isReserved) {
      Logger.warn(`Seat ${message.seatNumber} on flight ${message.flightNumber} is not reserved.`);
      return;
    }

    seat.isReserved = false;
    await _seatRepository.reserveSeat(seat); // reserveSeat calls update, so we can reuse it to update the entity

    Logger.log(`Seat ${message.seatNumber} on flight ${message.flightNumber} has been released due to booking cancellation.`);
  }
}
