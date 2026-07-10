import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../entities/user.entity';

@Entity('achievements')
@Unique(['user_id', 'type'])
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  type: string; // FIRST_WIN, BLUFF_MASTER, ALL_IN_HERO

  @CreateDateColumn()
  unlocked_at: Date;
}
