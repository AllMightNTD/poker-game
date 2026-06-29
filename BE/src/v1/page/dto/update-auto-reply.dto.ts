import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateAutoReplyDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  auto_reply_enabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  welcome_message?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  faq_data?: { question: string; answer: string }[];
}
