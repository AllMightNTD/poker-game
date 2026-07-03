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
import { GameHand } from './game_hand.entity';

export type PokerStreet = 'preflop' | 'flop' | 'turn' | 'river';
export type PokerActionType =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'bet'
  | 'allin'
  | 'timeout';

/**
 * hand_actions — Nhật ký từng hành động trong ván bài.
 * Là nguồn dữ liệu cho:
 *   - Hand History hiển thị trên FE
 *   - Tính VPIP / PFR / 3-bet stats
 *   - Replay / audit ván bài
 */
@Entity('hand_actions')
export class HandAction extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  hand_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'int' })
  seat_number: number;

  /** Vòng cược: preflop | flop | turn | river */
  @Column({ type: 'varchar', length: 10 })
  stage: PokerStreet;

  /** Loại hành động */
  @Column({ type: 'varchar', length: 15 })
  action_type: PokerActionType;

  /** Số chip bet/raise/call (0 nếu fold hoặc check) */
  @Column({ type: 'bigint', default: '0' })
  amount: string;

  /** Thứ tự hành động trong toàn bộ ván (để sort/replay đúng) */
  @Column({ type: 'int', default: 0 })
  action_order: number;

  @Column({ type: 'boolean', default: false })
  is_all_in: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => GameHand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hand_id' })
  hand: GameHand;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
