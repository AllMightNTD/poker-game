import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ example: 'Vip Table 1', description: 'Table name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'TEXAS', description: 'Game type' })
  @IsString()
  @IsNotEmpty()
  game_type: string;

  @ApiProperty({ example: '5', description: 'Small blind amount' })
  @IsNotEmpty()
  small_blind: string;

  @ApiProperty({ example: '10', description: 'Big blind amount' })
  @IsNotEmpty()
  big_blind: string;

  @ApiProperty({ example: '0', description: 'Ante amount' })
  @IsOptional()
  ante?: string;

  @ApiProperty({
    example: 9,
    description: 'Maximum players allowed at the table',
  })
  @IsNumber()
  @IsNotEmpty()
  max_players: number;

  @ApiProperty({ example: '400', description: 'Minimum buy-in chip amount' })
  @IsNotEmpty()
  min_buyin: string;

  @ApiProperty({ example: '2000', description: 'Maximum buy-in chip amount' })
  @IsNotEmpty()
  max_buyin: string;

  @ApiProperty({
    example: 5.0,
    description: 'Rake rate in percentage (e.g. 5.00 for 5%)',
  })
  @IsNumber()
  @IsNotEmpty()
  rake_rate: number;

  @ApiProperty({ example: '30', description: 'Maximum rake cap per hand' })
  @IsNotEmpty()
  rake_cap: string;

  @ApiProperty({
    example: { allow_bomb_pot: true, allow_rit: true },
    description: 'Custom configuration settings',
  })
  @IsObject()
  @IsOptional()
  custom_settings?: Record<string, any>;
}
