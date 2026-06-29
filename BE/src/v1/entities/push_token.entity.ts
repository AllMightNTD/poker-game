import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PushPlatform } from 'src/constants/enums';
import { User } from './user.entity';

@Entity('push_tokens')
export class PushToken extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  token: string;

  @Column({ type: 'enum', enum: PushPlatform })
  platform: PushPlatform;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_used_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
