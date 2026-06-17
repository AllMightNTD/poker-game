import { MessagePermission, UserStatus } from 'src/constants/enums';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from 'src/v1/entities/article.entity';
import { Comment } from 'src/v1/entities/comment.entity';
import { Notification } from 'src/v1/entities/notification.entity';
import { Post } from 'src/v1/entities/post.entity';
import { Profile } from 'src/v1/entities/profile.entity';
import { Reaction } from 'src/v1/entities/reaction.entity';
import { RefreshToken } from 'src/v1/entities/refresh_token.entity';
import { Story } from 'src/v1/entities/story.entity';
import { UserPresence } from 'src/v1/entities/user_presence.entity';
import { UserRole } from 'src/v1/entities/user_role.entity';
import { UserSettings } from 'src/v1/entities/user_settings.entity';
import { UserStats } from 'src/v1/entities/user_stats.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  facebook_id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  reset_password_token: string;

  @Column({ type: 'datetime', nullable: true })
  reset_password_expires_at: Date;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Column({ type: 'boolean', default: true })
  is_active_status: boolean;

  @Column({ type: 'enum', enum: MessagePermission, default: MessagePermission.EVERYONE })
  message_permission: MessagePermission;

  @Column({ type: 'datetime', nullable: true })
  email_verified_at: Date;

  @Column({ type: 'datetime', nullable: true })
  phone_verified_at: Date;

  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // ---- Relations ----

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToOne(() => UserSettings, (settings) => settings.user)
  settings: UserSettings;

  @OneToOne(() => UserStats, (stats) => stats.user)
  stats: UserStats;

  @OneToOne(() => UserPresence, (presence) => presence.user)
  presence: UserPresence;

  @OneToMany(() => UserRole, (ur) => ur.user)
  user_roles: UserRole[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Story, (story) => story.user)
  stories: Story[];

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany(() => Notification, (n) => n.actor)
  acted_notifications: Notification[];
}
