import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'bigint', default: '0' })
  chips_balance: string;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
