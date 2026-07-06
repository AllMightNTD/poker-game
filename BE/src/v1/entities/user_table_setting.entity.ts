import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PokerTable } from './poker_table.entity';

@Entity('user_table_settings')
export class UserTableSetting extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'bigint' })
  table_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  table_background: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  card_deck_style: string;

  @Column({ type: 'int', default: 100 })
  dealer_voice_vol: number;

  @Column({ type: 'int', default: 100 })
  sound_effects_vol: number;

  @Column({ type: 'boolean', default: false })
  mute_all_voice: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: PokerTable;
}
