import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ type: 'varchar', length: 20, default: 'waiting' })
  status: string; // waiting | running | paused | closed

  @Column({ type: 'bigint', nullable: true })
  current_hand_id: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
