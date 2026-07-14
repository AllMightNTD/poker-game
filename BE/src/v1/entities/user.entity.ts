import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from 'src/constants/enums';
import { AuditLog } from './audit_log.entity';

import { UserSettings } from './user_settings.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  is_active_status: boolean;

  @OneToOne(() => UserSettings, (settings) => settings.user)
  settings: UserSettings;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLog: AuditLog;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.actor)
  actor: AuditLog;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
