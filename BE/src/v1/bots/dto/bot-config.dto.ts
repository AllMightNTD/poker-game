import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum BotDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class AddBotDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Số lượng Bot muốn thêm vào phòng (1-5)',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(8)
  @IsOptional()
  count?: number = 1;

  @ApiPropertyOptional({
    enum: BotDifficulty,
    example: BotDifficulty.MEDIUM,
    description: 'Cấp độ trí tuệ nhân tạo của Bot',
    default: BotDifficulty.MEDIUM,
  })
  @IsEnum(BotDifficulty)
  @IsOptional()
  difficulty?: BotDifficulty = BotDifficulty.MEDIUM;

  @ApiPropertyOptional({
    example: 'PokerPro_Bot',
    description: 'Tên hiển thị tùy chỉnh cho Bot (nếu để trống sẽ tự tạo)',
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bot1',
    description: 'URL ảnh đại diện tùy chỉnh (nếu để trống sẽ tự chọn)',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    example: 'US',
    description: 'Mã quốc gia ISO (VD: US, VN, JP, KR, DE)',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: 100000,
    description:
      'Số chip khởi tạo mang vào bàn (nếu để trống dùng mặc định phòng)',
  })
  @IsNumber()
  @IsOptional()
  chips?: number;
}

export class RemoveBotDto {
  @ApiProperty({
    example: 'bot-uuid-1234',
    description: 'ID người dùng của Bot cần đuổi khỏi phòng',
  })
  @IsString()
  botUserId: string;
}
