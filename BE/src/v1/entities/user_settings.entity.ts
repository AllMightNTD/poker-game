import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Audience,
  ProfileVisibility,
  TwoFactorMethod,
} from 'src/constants/enums';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'enum', enum: Audience, default: Audience.FRIENDS })
  post_default_audience: Audience;

  @Column({
    type: 'enum',
    enum: ProfileVisibility,
    default: ProfileVisibility.FRIENDS,
  })
  profile_visibility: ProfileVisibility;

  @Column({
    type: 'enum',
    enum: ProfileVisibility,
    default: ProfileVisibility.FRIENDS,
  })
  friend_list_visibility: ProfileVisibility;

  @Column({
    type: 'enum',
    enum: ProfileVisibility,
    default: ProfileVisibility.FRIENDS,
  })
  following_list_visibility: ProfileVisibility;

  @Column({ type: 'boolean', default: true })
  tag_review_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  timeline_review_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  face_recognition_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  two_factor_enabled: boolean;

  @Column({ type: 'enum', enum: TwoFactorMethod, nullable: true })
  two_factor_method: TwoFactorMethod;

  @Column({ type: 'boolean', default: true })
  ad_personalization: boolean;

  @Column({ type: 'datetime', nullable: true })
  data_download_requested_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
