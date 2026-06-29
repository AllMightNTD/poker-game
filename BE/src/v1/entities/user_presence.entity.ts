import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { PresenceStatus } from 'src/constants/enums';
import { User } from './user.entity';

@Entity('user_presence')
export class UserPresence extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: PresenceStatus,
    default: PresenceStatus.OFFLINE,
  })
  status: PresenceStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  custom_status: string;

  @Column({ type: 'datetime' })
  last_seen_at: Date;

  @Column({ type: 'boolean', default: false })
  is_invisible: boolean;

  // ---- Relations ----

  @OneToOne(() => User, (user) => user.presence, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
