import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReserveSeatDto {
  @ApiProperty({ example: '12A', description: 'Seat number to reserve' })
  @IsString()
  @IsNotEmpty()
  seatNumber: string;

  @ApiProperty({ example: 1, description: 'Flight ID' })
  @IsNumber()
  @IsNotEmpty()
  flightId: number;
}
