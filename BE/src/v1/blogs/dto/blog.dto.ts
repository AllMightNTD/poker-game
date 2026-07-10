import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Tiêu đề bài viết',
    example: 'Mastering the Preflop Range',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Nội dung HTML/Markdown của bài viết',
    example: '<p>Learn preflop range charts...</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Tóm tắt bài viết',
    required: false,
    example: 'A deep dive into preflop ranges...',
  })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({
    description: 'Đường dẫn ảnh bìa',
    required: false,
    example: 'https://images.unsplash.com/photo-xxx',
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({
    description: 'Danh mục bài viết',
    default: 'News',
    example: 'Strategy',
  })
  @IsString()
  @IsOptional()
  category?: string = 'News';

  @ApiProperty({
    description: 'Danh sách thẻ bài viết',
    type: [String],
    required: false,
    example: ['preflop', 'strategy'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Trạng thái xuất bản', default: true })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean = true;
}

export class UpdateBlogDto {
  @ApiProperty({
    description: 'Tiêu đề bài viết',
    required: false,
    example: 'Mastering the Preflop Range (Updated)',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Nội dung HTML/Markdown của bài viết',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Tóm tắt bài viết', required: false })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({ description: 'Đường dẫn ảnh bìa', required: false })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ description: 'Danh mục bài viết', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Danh sách thẻ bài viết',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Trạng thái xuất bản', required: false })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;
}
