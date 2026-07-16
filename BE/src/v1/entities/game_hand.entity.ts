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
import { PokerTable } from './poker_table.entity';

export type HandStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

@Entity('game_hands')
export class GameHand extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  table_id: string;

  @Column({ type: 'int', nullable: true })
  dealer_seat: number | null;

  @Column({ type: 'int', default: 0 })
  small_blind_seat: number;

  @Column({ type: 'int', default: 0 })
  big_blind_seat: number;

  /** Các lá bài trên sàn (community cards), ví dụ: "10S,JH,QD" */
  @Column({ type: 'varchar', length: 30, nullable: true })
  community_cards: string | null;

  /**
   * Phần bài còn lại trong bộ chưa chia — dùng để server deal tiếp
   * Lưu dưới dạng text JSON: ["AS","KH","2C",...]
   */
  @Column({ type: 'text', nullable: true })
  remaining_deck: string | null;

  @Column({ type: 'bigint', default: '0' })
  total_pot: string;

  /** Rake thu được trong ván này */
  @Column({ type: 'bigint', default: '0' })
  rake_amount: string;

  /**
   * Side pots dạng JSONB để tránh JOIN phức tạp trong real-time
   * Ví dụ: [{ "amount": 50000, "eligible_seats": [1, 3], "winner_seat": null }]
   */
  @Column({ type: 'json', nullable: true })
  side_pots_json: object | null;

  @Column({ type: 'varchar', length: 12, default: 'preflop' })
  hand_stage: HandStage;

  @Column({ type: 'varchar', length: 255, nullable: true })
  server_seed: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_seed: string | null;

  @Column({ type: 'text', nullable: true })
  shuffled_deck: string | null;

  /** User đang đến lượt hành động — để phục hồi trạng thái khi reconnect */
  @Column({ type: 'varchar', nullable: true })
  current_turn_user_id: string | null;

  @Column({ type: 'bigint', default: '0' })
  rake_taken: string;

  @CreateDateColumn()
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  ended_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'json', nullable: true })
  ai_analysis: {
    overall_score: number;
    summary: string;
    rounds: {
      preflop: string;
      flop?: string;
      turn?: string;
      river?: string;
    };
    key_mistake?: string | null;
  } | null;

  @Column({ type: 'json', nullable: true })
  replay_json: {
    hand: {
      id: string;
      table_name: string | null;
      dealer_seat: number | null;
      small_blind_seat: number;
      big_blind_seat: number;
      community_cards: string | null;
      total_pot: string;
      hand_stage: string;
      started_at: Date | string;
      ended_at: Date | string | null;
    };
    players: Array<{
      user_id: string;
      user_name: string;
      avatar_url: string | null;
      seat_number: number;
      hole_cards: string;
      initial_stack: string;
      chips_won: string;
      net_gain_loss: string;
      is_winner: boolean;
    }>;
    actions: Array<{
      id?: string;
      user_id: string;
      user_name: string;
      seat_number: number;
      stage: string;
      action_type: string;
      amount: string | number;
      action_order: number;
      is_all_in: boolean;
    }>;
  } | null;

  // ---- Relations ----

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: PokerTable;
}
