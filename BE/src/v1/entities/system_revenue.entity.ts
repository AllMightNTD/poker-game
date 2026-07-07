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
import { PokerTable } from './poker_table.entity';
import { GameHand } from './game_hand.entity';

/**
 * system_revenue — MODULE 5: REVENUE
 * Ghi nhận doanh thu rake hệ thống thu được từ mỗi ván bài.
 *
 * revenue_amount = rake thực tế thu từ total_pot của ván đó,
 * bị giới hạn bởi rake_cap của bàn (poker_tables.rake_cap).
 *
 * Dùng để:
 *  - Thống kê doanh thu theo ngày / tuần / tháng cho admin.
 *  - Audit trail minh bạch mỗi khi hệ thống lấy rake.
 */
@Entity('system_revenue')
export class SystemRevenue extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  room_id: string; // poker_tables.id

  @Column({ type: 'bigint' })
  hand_id: string; // game_hands.id

  /** Số chip rake thực tế thu được (đã áp trần rake_cap) */
  @Column({ type: 'bigint', default: '0' })
  revenue_amount: string;

  /**
   * Tỷ lệ rake đã áp dụng tại thời điểm ván diễn ra
   * (snapshot — tránh thay đổi cấu hình bàn ảnh hưởng lịch sử)
   */
  @Column({ type: 'numeric', precision: 4, scale: 2, default: 5.0 })
  rake_rate_applied: number;

  /** Tổng pot dùng để tính rake */
  @Column({ type: 'bigint', default: '0' })
  pot_total: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  table: PokerTable;

  @ManyToOne(() => GameHand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hand_id' })
  hand: GameHand;
}
