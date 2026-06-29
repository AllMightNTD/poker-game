import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Audience, PostType, PostMediaType } from 'src/constants/enums';

export class PostMediaDto {
  @IsString()
  @IsNotEmpty()
  file_url: string;

  @IsEnum(PostMediaType)
  @IsNotEmpty()
  type: PostMediaType;

  @IsInt()
  @IsOptional()
  sort_order?: number;
}

export class CreatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsEnum(Audience)
  @IsNotEmpty()
  audience: Audience;

  @IsString()
  @IsOptional()
  feeling?: string;

  @IsString()
  @IsOptional()
  location_name?: string;

  @IsString()
  @IsOptional()
  post_background?: string;

  @IsString()
  @IsOptional()
  group_id?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PostMediaDto)
  media?: PostMediaDto[];
}
