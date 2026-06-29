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

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  entity: string;

  @Column({ type: 'varchar' })
  entity_id: string;

  @Column({ type: 'json', nullable: true })
  old_value: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  new_value: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
