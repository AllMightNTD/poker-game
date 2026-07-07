import {
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { GameHand } from './game_hand.entity';

/**
 * hand_positions — Vị trí của từng người chơi trong một ván bài.
 * Composite PK: (hand_id, user_id)
 *
 * position_type values:
 *   dealer | small_blind | big_blind | utg | utg+1 | mp | co | btn | sb | bb
 */
export type PokerPositionType =
  | 'dealer'
  | 'small_blind'
  | 'big_blind'
  | 'utg'
  | 'utg_1'
  | 'mp'
  | 'co'
  | 'btn';

@Entity('hand_positions')
export class HandPosition extends BaseEntity {
  @Column({ type: 'bigint', primary: true })
  hand_id: string;

  @Column({ type: 'varchar', primary: true })
  user_id: string;

  @Column({ type: 'int' })
  seat_number: number;

  /** Vị trí tương đối trong ván: dealer / small_blind / big_blind / utg / ... */
  @Column({ type: 'varchar', length: 20 })
  position_type: PokerPositionType;

  /**
   * false khi người chơi đã fold hoặc all-in nhưng vẫn còn trong ván,
   * true khi đang active (chưa fold, chưa all-in done)
   */
  @Column({ type: 'boolean', default: true })
  is_active_in_hand: boolean;

  @Column({ type: 'bigint', default: '0' })
  stack_at_start: string; // stack chip lúc bắt đầu ván

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => GameHand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hand_id' })
  hand: GameHand;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
