import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SearchFlightsDto {
  @ApiPropertyOptional({ example: '2025-06-15', description: 'Departure date filter' })
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @ApiPropertyOptional({ example: 'HAN', description: 'Departure airport code' })
  @IsOptional()
  @IsString()
  departureCode?: string;

  @ApiPropertyOptional({ example: 'SGN', description: 'Arrival airport code' })
  @IsOptional()
  @IsString()
  arriveCode?: string;
}
