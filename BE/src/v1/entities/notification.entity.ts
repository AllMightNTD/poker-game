import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar' })
  actor_id: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'json' })
  payload: Record<string, any>;

  @Column({ type: 'datetime', nullable: true })
  read_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.acted_notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'actor_id' })
  actor: User;
}
