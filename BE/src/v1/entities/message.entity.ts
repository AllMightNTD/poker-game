import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageType } from 'src/constants/enums';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';
import { MessageReaction } from './message_reaction.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  conversation_id: string;

  @Column({ type: 'varchar' })
  sender_id: string;

  @Column({ type: 'varchar', nullable: true })
  reply_to_id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'datetime', nullable: true })
  edited_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Message, (message) => message.replies, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reply_to_id' })
  reply_to: Message;

  @OneToMany(() => Message, (message) => message.reply_to)
  replies: Message[];

  @OneToMany(() => MessageReaction, (mr) => mr.message)
  reactions: MessageReaction[];
}
