import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateWalletDto {
  @ApiProperty({ example: 'ADD', description: 'Action type' })
  @IsEnum(['ADD', 'REMOVE', 'SET'])
  @IsNotEmpty()
  action: 'ADD' | 'REMOVE' | 'SET';

  @ApiProperty({ example: 1000, description: 'Amount to modify' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Compensate user for server crash', description: 'Reason for the wallet modification' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
