import { Controller, Put, Param, Inject, NotFoundException, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IBookingRepository } from '@/data/repositories/booking.repository';
import { JwtGuard } from 'building-blocks/passport/jwt.guard';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { BookingCancelled } from 'building-blocks/contracts/booking.contract';
import { IRabbitmqPublisher } from 'building-blocks/rabbitmq/rabbitmq-publisher';

export class CancelBookingCommand {
  constructor(public readonly id: number, public readonly passengerId: number) {}
}

export class CancelBookingRequestDto {
  @IsNumber()
  @IsNotEmpty()
  passengerId: number;
}

@ApiBearerAuth()
@ApiTags('Bookings')
@Controller({
  path: `/booking`,
  version: '1'
})
export class CancelBookingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put(':id/cancel')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully.' })
  @ApiResponse({ status: 404, description: 'Booking not found or not owned by the passenger.' })
  public async cancelBooking(@Param('id') id: string, @Body() body: CancelBookingRequestDto) {
    await this.commandBus.execute(new CancelBookingCommand(+id, body.passengerId));
    return { success: true };
  }
}

@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    @Inject('IBookingRepository') private readonly bookingRepository: IBookingRepository,
    @Inject('IRabbitmqPublisher') private rabbitmqPublisher: IRabbitmqPublisher
  ) {}

  async execute(command: CancelBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${command.id} not found`);
    }

    if (booking.passengerId !== command.passengerId) {
      throw new NotFoundException(`Booking not owned by passenger ${command.passengerId}`);
    }

    booking.status = 'CANCELLED';
    booking.updatedAt = new Date();

    await this.bookingRepository.updateBooking(booking);

    // Emit BookingCancelled event
    await this.rabbitmqPublisher.publishMessage(
      new BookingCancelled({
        id: booking.id,
        flightNumber: booking.flightNumber,
        aircraftId: booking.aircraftId,
        departureAirportId: booking.departureAirportId,
        arriveAirportId: booking.arriveAirportId,
        flightDate: booking.flightDate,
        price: booking.price,
        description: booking.description,
        seatNumber: booking.seatNumber,
        passengerName: booking.passengerName,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      })
    );
  }
}
