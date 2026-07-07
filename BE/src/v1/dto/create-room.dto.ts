import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
  Min,
  IsIn,
} from 'class-validator';

export class CustomSettingsDto {
  @ApiProperty({ enum: ['PUBLIC', 'PRIVATE', 'FRIENDS'], default: 'PUBLIC' })
  @IsIn(['PUBLIC', 'PRIVATE', 'FRIENDS'])
  @IsOptional()
  table_visibility?: string = 'PUBLIC';

  @ApiProperty({ description: 'Mật khẩu nếu là PRIVATE', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_rebuy?: boolean = true;

  @ApiProperty({ enum: ['AUTO_FOLD', 'AUTO_CHECK'], default: 'AUTO_FOLD' })
  @IsIn(['AUTO_FOLD', 'AUTO_CHECK'])
  @IsOptional()
  table_timeout_action?: string = 'AUTO_FOLD';

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_chat?: boolean = true;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_emotes?: boolean = true;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  max_spectators?: number = 0; // 0 = unlimited

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  max_waiting_list?: number = 0;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  anti_collusion_level?: string = 'LOW';

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  allow_bomb_pot?: boolean = false;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_rit?: boolean = true;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_rabbit_hunt?: boolean = true;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_muck?: boolean = true;
}

export class TournamentSettingsDto {
  @ApiProperty({ description: 'Late registration (minutes)', required: false })
  @IsNumber()
  @IsOptional()
  late_registration_minutes?: number;

  @ApiProperty({ description: 'Min players to start', required: false })
  @IsNumber()
  @IsOptional()
  min_players_to_start?: number;

  @ApiProperty({
    description: 'Auto start when X players joined',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  auto_start_player_count?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  allow_addon?: boolean;

  @ApiProperty({ description: 'Break interval in minutes', required: false })
  @IsNumber()
  @IsOptional()
  break_interval?: number;

  @ApiProperty({ description: 'Break duration in minutes', required: false })
  @IsNumber()
  @IsOptional()
  break_duration?: number;

  @ApiProperty({ enum: ['AUTO_FOLD', 'AUTO_CHECK'], default: 'AUTO_FOLD' })
  @IsIn(['AUTO_FOLD', 'AUTO_CHECK'])
  @IsOptional()
  table_timeout_action?: string = 'AUTO_FOLD';

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_chat?: boolean = true;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_emotes?: boolean = true;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  max_spectators?: number = 0;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' })
  @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  anti_collusion_level?: string = 'LOW';
}

export class CreateRoomDto {
  @ApiProperty({ description: 'Tên phòng' })
  @IsString()
  room_name: string;

  @ApiProperty({ description: 'Biến thể Poker', default: 'NLH' })
  @IsString()
  @IsOptional()
  game_type?: string = 'NLH';

  @ApiProperty({
    description: 'Chế độ chơi',
    enum: ['CUSTOM', 'TOURNAMENT'],
    default: 'CUSTOM',
  })
  @IsIn(['CUSTOM', 'TOURNAMENT'])
  @IsOptional()
  mode?: string = 'CUSTOM';

  @ApiProperty({ description: 'Small Blind / Starting Blind' })
  @IsNumber()
  @Min(1)
  small_blind: number;

  @ApiProperty({
    description: 'Số người chơi tối đa (VD: 2, 6, 9)',
    default: 9,
  })
  @IsNumber()
  @IsOptional()
  max_players?: number = 9;

  @ApiProperty({
    description: 'Thời gian suy nghĩ mỗi Turn (giây)',
    default: 15,
  })
  @IsNumber()
  @IsOptional()
  turn_time_limit?: number = 15;

  @ApiProperty({
    description: 'Thời gian Time Bank dự trữ (giây)',
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  time_bank?: number = 30;

  // Tiền buy-in cho Cash Game
  @ApiProperty({
    description: 'Mua vào tối thiểu (mặc định = 40x SB)',
    required: false,
  })
  @IsOptional()
  min_buy_in?: number;

  @ApiProperty({
    description: 'Mua vào tối đa (mặc định = 200x SB)',
    required: false,
  })
  @IsOptional()
  max_buy_in?: number;

  @ApiProperty({
    description: 'Cấu hình Cash Game nâng cao',
    type: CustomSettingsDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => CustomSettingsDto)
  @IsOptional()
  custom_settings?: CustomSettingsDto;

  @ApiProperty({
    description: 'Cấu hình Giải đấu',
    type: TournamentSettingsDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => TournamentSettingsDto)
  @IsOptional()
  tournament_settings?: TournamentSettingsDto;
}
