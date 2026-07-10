import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('leaderboard_entries')
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  period_type: string; // weekly, monthly

  @Column({ type: 'varchar', length: 15 })
  period: string; // 2026-07 (month), 2026-W28 (week)

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'bigint', default: 0 })
  chips_won: string;

  @Column({ type: 'int', default: 0 })
  hands_played: number;

  @Column({ type: 'bigint', default: 0 })
  rake_paid: string;

  @CreateDateColumn()
  snapshot_at: Date;
}
