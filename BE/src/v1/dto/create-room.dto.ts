import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ description: 'Tên phòng' })
  name: string;

  @ApiProperty({ description: 'Loại game', required: false })
  game_type?: string;

  @ApiProperty({ description: 'Small Blind' })
  small_blind: number | string;

  @ApiProperty({ description: 'Big Blind', required: false })
  big_blind?: number | string;

  @ApiProperty({ description: 'Số người chơi tối đa', required: false })
  max_players?: number;

  @ApiProperty({ description: 'Yêu cầu mật khẩu', required: false })
  require_password?: boolean;

  @ApiProperty({ description: 'Mật khẩu', required: false })
  password?: string;

  @ApiProperty({ description: 'Action time allowed (seconds)', required: false })
  action_time_allowed?: number;

  @ApiProperty({ description: 'Extra time bank (seconds)', required: false })
  extra_time_bank?: number;

  @ApiProperty({ description: 'Minimum buy-in (number of blinds)', required: false })
  min_buyin?: number | string;

  @ApiProperty({ description: 'Maximum buy-in (number of blinds)', required: false })
  max_buyin?: number | string;
}
