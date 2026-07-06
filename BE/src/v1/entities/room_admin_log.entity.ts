import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PokerTable } from './poker_table.entity';

export type RoomAdminLogType =
  | 'kick'
  | 'mute'
  | 'unmute'
  | 'ban'
  | 'config_change'
  | 'close_table'
  | 'transfer_host';

/**
 * room_admin_logs — Nhật ký hành động quản trị trong phòng bài.
 * Tương ứng module "room_admin_logs" trong diagram.
 */
@Entity('room_admin_logs')
export class RoomAdminLog extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  /** room_id tương ứng với poker_tables.id */
  @Column({ type: 'bigint' })
  room_id: string;

  /** Người thực hiện hành động (chủ bàn / admin) */
  @Column({ type: 'varchar' })
  actor_id: string;

  /** Người bị tác động (null nếu là config_change / close_table) */
  @Column({ type: 'varchar', nullable: true })
  target_id: string | null;

  /** Loại hành động */
  @Column({ type: 'varchar', length: 20 })
  log_type: RoomAdminLogType;

  /** Mô tả chi tiết hành động */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  table: PokerTable;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'target_id' })
  target: User | null;
}
