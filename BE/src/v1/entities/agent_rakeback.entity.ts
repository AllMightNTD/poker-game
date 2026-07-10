import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Club } from './club.entity';
import { User } from './user.entity';

@Entity('agent_rakebacks')
export class AgentRakeback extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  club_id: string;

  @Column({ type: 'uuid' })
  agent_id: string;

  /** Format: 'YYYY-MM' */
  @Column({ type: 'varchar', length: 7 })
  period: string;

  /** Total rake collected by this agent's members in the period */
  @Column({ type: 'bigint', default: '0' })
  total_rake: string;

  @Column({ type: 'numeric', precision: 4, scale: 2, default: 10.0 })
  rakeback_pct: number;

  /** rakeback_amount = total_rake * rakeback_pct / 100 */
  @Column({ type: 'bigint', default: '0' })
  rakeback_amount: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Club, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: User;
}
