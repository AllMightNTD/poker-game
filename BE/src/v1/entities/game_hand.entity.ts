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

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: PokerTable;
}
