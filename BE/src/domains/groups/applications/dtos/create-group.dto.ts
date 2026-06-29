import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { GroupPrivacy } from 'src/constants/enums';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(GroupPrivacy)
  @IsOptional()
  privacy?: GroupPrivacy;
}
