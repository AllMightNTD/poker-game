import {
  BaseEntity,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FriendRequestStatus } from 'src/constants/enums';
import { User } from './user.entity';

@Entity('friend_requests')
@Unique(['sender_id', 'receiver_id'])
@Check(`"sender_id" != "receiver_id"`)
export class FriendRequest extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  sender_id: string;

  @Column({ type: 'varchar' })
  receiver_id: string;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  responded_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
