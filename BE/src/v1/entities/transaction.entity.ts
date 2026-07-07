import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  user_id: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ['DEPOSIT', 'WITHDRAW', 'TRANSFER', 'GAME_WIN', 'GAME_LOSS'],
  })
  type: string;

  @Column({ type: 'bigint' })
  amount: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  payment_method: string;

  @Column({ type: 'varchar', nullable: true })
  proof_image: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true })
  processed_by: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
