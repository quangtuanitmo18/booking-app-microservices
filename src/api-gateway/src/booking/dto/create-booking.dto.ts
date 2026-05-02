import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'Passenger ID' })
  @IsNumber()
  @IsNotEmpty()
  passengerId: number;

  @ApiProperty({ example: 1, description: 'Flight ID' })
  @IsNumber()
  @IsNotEmpty()
  flightId: number;

  @ApiProperty({ example: 'Business trip', description: 'Description or remarks' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
