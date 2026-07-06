import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'player1@poker.com',
    description: 'Email address of the new user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'Password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'PokerKing99',
    description: 'Unique display username',
  })
  @IsString()
  @IsNotEmpty()
  user_name: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'player1@poker.com',
    description: 'Registered email address',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'Account password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Keep the session active for longer',
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'uuid4.plaintext-refresh-token',
    description: 'Refresh token received at login (format: <id>.<token>)',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
