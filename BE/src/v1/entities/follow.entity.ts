import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import {
  FollowingType,
  FollowPriority,
  FollowStatus,
} from 'src/constants/enums';
import { User } from './user.entity';

@Entity('follows')
export class Follow extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  follower_id: string;

  @PrimaryColumn({ type: 'enum', enum: FollowingType })
  following_type: FollowingType;

  @PrimaryColumn({ type: 'varchar' })
  following_entity_id: string;

  @Column({
    type: 'enum',
    enum: FollowPriority,
    default: FollowPriority.DEFAULT,
  })
  priority: FollowPriority;

  @Column({ type: 'enum', enum: FollowStatus, default: FollowStatus.ACTIVE })
  status: FollowStatus;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  // Note: following_entity_id could refer to User, Page, or Group (Polymorphic)
}
