import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Gender, RelationshipStatus } from 'src/constants/enums';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;

  @IsUrl()
  @IsOptional()
  cover_url?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  date_of_birth?: Date;

  @IsString()
  @IsOptional()
  location_city?: string;

  @IsString()
  @IsOptional()
  location_country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  postcode?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsEnum(RelationshipStatus)
  @IsOptional()
  relationship_status?: RelationshipStatus;

  @IsOptional()
  work?: Record<string, any>[];

  @IsOptional()
  education?: Record<string, any>[];

  @IsOptional()
  hobbies?: string[];

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  profile_music_id?: string;
}
