import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  subtitle: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  badge: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  color_gradient: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon_type: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  link_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  badge?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  color_gradient?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon_type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  link_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}
