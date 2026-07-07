import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator';

export class UpdateTableDto {
  @ApiProperty({
    example: 'Vip Table 1 (Updated)',
    description: 'Table name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'TEXAS', description: 'Game type', required: false })
  @IsString()
  @IsOptional()
  game_type?: string;

  @ApiProperty({
    example: '10',
    description: 'Small blind amount',
    required: false,
  })
  @IsOptional()
  small_blind?: string;

  @ApiProperty({
    example: '20',
    description: 'Big blind amount',
    required: false,
  })
  @IsOptional()
  big_blind?: string;

  @ApiProperty({ example: '2', description: 'Ante amount', required: false })
  @IsOptional()
  ante?: string;

  @ApiProperty({
    example: 6,
    description: 'Maximum players allowed',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  max_players?: number;

  @ApiProperty({
    example: '1000',
    description: 'Minimum buy-in',
    required: false,
  })
  @IsOptional()
  min_buyin?: string;

  @ApiProperty({
    example: '4000',
    description: 'Maximum buy-in',
    required: false,
  })
  @IsOptional()
  max_buyin?: string;

  @ApiProperty({
    example: 3.5,
    description: 'Rake rate percentage',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rake_rate?: number;

  @ApiProperty({ example: '50', description: 'Rake cap', required: false })
  @IsOptional()
  rake_cap?: string;

  @ApiProperty({
    example: { allow_bomb_pot: false },
    description: 'Custom settings',
    required: false,
  })
  @IsObject()
  @IsOptional()
  custom_settings?: Record<string, any>;
}
