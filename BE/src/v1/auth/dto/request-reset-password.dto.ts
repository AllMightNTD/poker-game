import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'player1@poker.com',
    description: 'Email address associated with the account',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
