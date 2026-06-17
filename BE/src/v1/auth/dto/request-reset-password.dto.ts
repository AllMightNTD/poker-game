import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordResetDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
