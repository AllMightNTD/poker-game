import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Audience, ProfileVisibility, TwoFactorMethod } from 'src/constants/enums';

export class UpdateSettingsDto {
  @IsEnum(Audience)
  @IsOptional()
  post_default_audience?: Audience;

  @IsEnum(ProfileVisibility)
  @IsOptional()
  profile_visibility?: ProfileVisibility;

  @IsEnum(ProfileVisibility)
  @IsOptional()
  friend_list_visibility?: ProfileVisibility;

  @IsEnum(ProfileVisibility)
  @IsOptional()
  following_list_visibility?: ProfileVisibility;

  @IsBoolean()
  @IsOptional()
  tag_review_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  timeline_review_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  face_recognition_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  two_factor_enabled?: boolean;

  @IsEnum(TwoFactorMethod)
  @IsOptional()
  two_factor_method?: TwoFactorMethod;

  @IsBoolean()
  @IsOptional()
  ad_personalization?: boolean;
}
