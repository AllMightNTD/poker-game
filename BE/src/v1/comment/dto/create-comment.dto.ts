import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommentTargetType, CommentType } from 'src/constants/enums';

export class CreateCommentDto {
  @IsEnum(CommentTargetType)
  @IsOptional()
  target_type?: CommentTargetType;

  @IsString()
  @IsOptional()
  target_id?: string;

  @IsString()
  @IsOptional()
  post_id?: string;

  @IsString()
  @IsOptional()
  parent_id?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  media_url?: string;

  @IsString()
  @IsOptional()
  sticker_url?: string;

  @IsEnum(CommentType)
  @IsOptional()
  type?: CommentType;
}
