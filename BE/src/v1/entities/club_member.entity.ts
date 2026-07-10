import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Club } from './club.entity';
import { User } from './user.entity';

export type ClubMemberRole = 'OWNER' | 'AGENT' | 'MEMBER';
export type ClubMemberStatus = 'active' | 'pending' | 'banned';

@Entity('club_members')
@Unique(['club_id', 'user_id'])
export class ClubMember extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  club_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: ['OWNER', 'AGENT', 'MEMBER'],
    default: 'MEMBER',
  })
  role: ClubMemberRole;

  /** Virtual chip balance within this club (managed by agent) */
  @Column({ type: 'bigint', default: '0' })
  credit_balance: string;

  @Column({ type: 'int', default: 0 })
  total_hands: number;

  @Column({ type: 'bigint', default: '0' })
  total_rake_paid: string;

  @Column({
    type: 'enum',
    enum: ['active', 'pending', 'banned'],
    default: 'active',
  })
  status: ClubMemberStatus;

  @CreateDateColumn()
  joined_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Club, (club) => club.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
