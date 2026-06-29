import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification_preferences')
export class NotificationPreference extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @PrimaryColumn({ type: 'varchar', length: 100 })
  notification_type: string;

  @Column({ type: 'boolean', default: true })
  via_push: boolean;

  @Column({ type: 'boolean', default: true })
  via_email: boolean;

  @Column({ type: 'boolean', default: true })
  via_websocket: boolean;

  @Column({ type: 'time', nullable: true })
  quiet_hours_start: string;

  @Column({ type: 'time', nullable: true })
  quiet_hours_end: string;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
