import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-z0-9_.]+$/, {
    message:
      'username can only contain lowercase letters, numbers, underscores and dots',
  })
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar_url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  cover_url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;
}
