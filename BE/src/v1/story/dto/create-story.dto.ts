import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { StoryAudience, StoryType } from 'src/constants/enums';

export class CreateStoryDto {
  @IsNotEmpty()
  @IsEnum(StoryType)
  type: StoryType;

  @IsOptional()
  @IsString()
  media_url?: string;

  @IsOptional()
  @IsString()
  text_content?: string;

  @IsOptional()
  @IsString()
  background_color?: string;

  @IsOptional()
  @IsNumber()
  duration_seconds?: number;

  @IsOptional()
  @IsEnum(StoryAudience)
  audience?: StoryAudience;
}
