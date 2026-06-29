import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ConversationParticipantRole } from 'src/constants/enums';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('conversation_participants')
export class ConversationParticipant extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  conversation_id: string;

  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: ConversationParticipantRole,
    default: ConversationParticipantRole.MEMBER,
  })
  role: ConversationParticipantRole;

  @Column({ type: 'varchar', nullable: true })
  last_read_message_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nickname: string;

  @Column({ type: 'boolean', default: false })
  is_muted: boolean;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'boolean', default: false })
  is_hidden: boolean;

  @Column({ type: 'boolean', default: false })
  is_spam: boolean;

  @Column({ type: 'boolean', default: false })
  is_request: boolean;

  @CreateDateColumn()
  joined_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_read_message_id' })
  last_read_message: Message;
}
