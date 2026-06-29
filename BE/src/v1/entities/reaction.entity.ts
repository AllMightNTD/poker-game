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
import { ReactionTargetType } from 'src/constants/enums';
import { User } from './user.entity';

@Entity('reactions')
@Unique(['user_id', 'target_type', 'target_id'])
export class Reaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'enum', enum: ReactionTargetType })
  target_type: ReactionTargetType;

  @Column({ type: 'varchar' })
  target_id: string;

  @Column({ type: 'varchar', length: 50, name: 'type' })
  type: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, (user) => user.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
