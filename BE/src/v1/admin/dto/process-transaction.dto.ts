import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ProcessTransactionDto {
  @ApiProperty({ example: 'APPROVED', description: 'Transaction final status' })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({ example: 'Transfer successful', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
