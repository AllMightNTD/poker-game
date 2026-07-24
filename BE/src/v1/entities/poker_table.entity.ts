import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuditLog } from './audit_log.entity';
import { Club } from './club.entity';

@Entity('tables')
export class PokerTable extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  game_type: string;

  @Column({ type: 'varchar' })
  owner_id: string;

  @Column({ type: 'bigint', default: '0' })
  small_blind: string;

  @Column({ type: 'bigint', default: '0' })
  big_blind: string;

  @Column({ type: 'bigint', default: '0' })
  ante: string;

  @Column({ type: 'int', default: 9 })
  max_players: number;

  @Column({ type: 'bigint', default: '0' })
  min_buyin: string;

  @Column({ type: 'bigint', default: '0' })
  max_buyin: string;

  /** Tỷ lệ rake thu từ mỗi pot, đơn vị %. Ví dụ: 5.00 = 5% */
  @Column({ type: 'numeric', precision: 4, scale: 2, default: 5.0 })
  rake_rate: number;

  /** Giới hạn rake tối đa thu được mỗi hand (chip) */
  @Column({ type: 'bigint', default: '0' })
  rake_cap: string;

  // --- Game Config ---
  @Column({ type: 'varchar', length: 20, default: 'CUSTOM' })
  mode: string; // CUSTOM | TOURNAMENT

  // JSON columns to store advanced settings efficiently
  @Column({ type: 'json', nullable: true })
  custom_settings: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  tournament_settings: Record<string, any> | null;

  @Column({ type: 'varchar', length: 20, default: 'waiting' })
  status: string; // waiting | running | paused | closed

  @Column({ type: 'bigint', nullable: true })
  current_hand_id: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  auto_approve: boolean;

  // --- Auto Close / Activity Tracking ---
  @Column({ type: 'datetime', nullable: true })
  last_activity_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  last_hand_at: Date | null;

  @Column({ type: 'datetime', nullable: true })
  closing_started_at: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  closing_reason: string | null;

  @Column({ type: 'datetime', nullable: true })
  close_at: Date | null;

  @Column({ type: 'boolean', default: false })
  is_closing: boolean;

  /** null = public table, set = club-only table */
  @Column({ type: 'uuid', nullable: true })
  club_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.room)
  auditLog: AuditLog[];

  @ManyToOne(() => Club, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'club_id' })
  club: Club | null;
}
