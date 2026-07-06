import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PokerTable } from './poker_table.entity';

/** Trạng thái người ngồi bàn */
export type MemberStatus = 'active' | 'sitting_out' | 'disconnected' | 'left';

@Entity('table_sessions')
export class TableSession extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  table_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'int' })
  seat_number: number;

  @Column({ type: 'bigint', default: '0' })
  chips_at_table: string;  // current stack tại bàn

  /** active | sitting_out | disconnected | left */
  @Column({ type: 'varchar', length: 20, default: 'active' })
  member_status: MemberStatus;

  /** Người chơi bị mute chat trong phòng */
  @Column({ type: 'boolean', default: false })
  chat_muted: boolean;

  @Column({ type: 'boolean', default: false })
  is_dealer: boolean;

  @Column({ type: 'boolean', default: false })
  is_small_blind: boolean;

  @Column({ type: 'boolean', default: false })
  is_big_blind: boolean;

  @CreateDateColumn()
  joined_at: Date;

  @Column({ type: 'datetime', nullable: true })
  left_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: PokerTable;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
