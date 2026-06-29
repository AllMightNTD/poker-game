import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Poll } from './poll.entity';
import { PollOption } from './poll_option.entity';
import { User } from './user.entity';

@Entity('poll_votes')
export class PollVote extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  poll_id: string;

  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @PrimaryColumn({ type: 'varchar' })
  option_id: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Poll, (poll) => poll.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: Poll;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PollOption, (option) => option.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_id' })
  option: PollOption;
}
