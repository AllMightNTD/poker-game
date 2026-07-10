import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ example: 'High Rollers Club' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Private club for serious players.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 30, default: 50 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(200)
  max_members?: number;

  @ApiPropertyOptional({
    example: 5.0,
    description: 'Club rake rate override (%)',
  })
  @IsOptional()
  @Min(0)
  @Max(20)
  club_rake_rate?: number;
}

export class UpdateClubDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(200)
  max_members?: number;
}

export class JoinClubDto {
  @ApiProperty({ example: 'PKR7X2', description: '6-char invite code' })
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  code: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['AGENT', 'MEMBER'] })
  @IsEnum(['AGENT', 'MEMBER'])
  role: 'AGENT' | 'MEMBER';
}

export class TransferCreditDto {
  @ApiProperty({
    example: '1000000',
    description: 'Amount to transfer (positive = add, negative = deduct)',
  })
  @IsString()
  amount: string;

  @ApiProperty({ example: 'uuid-of-member' })
  @IsUUID()
  member_user_id: string;
}
