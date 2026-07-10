import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryColumn('uuid')
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', default: 0 })
  hands_played: number;

  @Column({ type: 'int', default: 0 })
  hands_won: number;

  @Column({ type: 'bigint', default: 0 })
  total_chips_won: string;

  @Column({ type: 'bigint', default: 0 })
  total_rake_paid: string;

  @Column({ type: 'bigint', default: 0 })
  biggest_pot: string;

  @Column({ type: 'int', default: 0 })
  current_xp: number;

  @Column({ type: 'varchar', length: 20, default: 'bronze' })
  level: string; // bronze, silver, gold, platinum, diamond

  @UpdateDateColumn()
  updated_at: Date;
}
