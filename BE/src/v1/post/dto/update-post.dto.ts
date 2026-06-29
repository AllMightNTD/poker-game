import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Audience, PostType } from 'src/constants/enums';
import { PostMediaDto } from './create-post.dto';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsEnum(Audience)
  @IsOptional()
  audience?: Audience;

  @IsString()
  @IsOptional()
  feeling?: string;

  @IsString()
  @IsOptional()
  location_name?: string;

  @IsString()
  @IsOptional()
  post_background?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PostMediaDto)
  media?: PostMediaDto[];
}
