import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';

@Entity('message_reactions')
export class MessageReaction extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  message_id: string;

  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  emoji: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Message, (message) => message.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
