import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PokerTable } from './poker_table.entity';

@Entity('in_room_chats')
export class InRoomChat extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  table_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', length: 20 })
  message_type: string;

  @Column({ type: 'text' })
  message_content: string;

  @CreateDateColumn()
  sent_at: Date;

  // ---- Relations ----

  @ManyToOne(() => PokerTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: PokerTable;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
