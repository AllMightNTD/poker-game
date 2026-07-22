import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Length,
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
  @ApiPropertyOptional({
    example: 'uuid4.plaintext-refresh-token',
    description: 'Refresh token received at login (format: <id>.<token>)',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '123456',
    description: 'Mã xác thực OTP (6 chữ số)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiPropertyOptional({
    description: 'JWT Token dùng để định danh email xác thực',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    example: 'player1@poker.com',
    description: 'Email dùng để xác thực thay thế token',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ResendOtpDto {
  @ApiProperty({
    example: 'player1@poker.com',
    description: 'Email của tài khoản cần gửi lại mã',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
