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
  hands_played: number = 0;

  @Column({ type: 'int', default: 0 })
  hands_won: number = 0;

  @Column({ type: 'bigint', default: 0 })
  total_chips_won: string = '0';

  @Column({ type: 'bigint', default: 0 })
  total_rake_paid: string = '0';

  @Column({ type: 'bigint', default: 0 })
  biggest_pot: string = '0';

  @Column({ type: 'int', default: 0 })
  current_xp: number = 0;

  @Column({ type: 'varchar', length: 20, default: 'bronze' })
  level: string = 'bronze';

  @UpdateDateColumn()
  updated_at: Date;
}
