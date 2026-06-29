import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PokerTable } from './poker_table.entity';

@Entity('voice_room_sessions')
export class VoiceRoomSession extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  table_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'boolean', default: false })
  is_mic_muted: boolean;

  @Column({ type: 'boolean', default: false })
  is_deafened: boolean;

  @Column({ type: 'boolean', default: false })
  is_speaking: boolean;

  // ---- Relations ----

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: PokerTable;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
