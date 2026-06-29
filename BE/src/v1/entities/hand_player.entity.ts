import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { GameHand } from './game_hand.entity';

@Entity('hand_players')
export class HandPlayer extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  hand_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hole_cards: string;

  @Column({ type: 'bigint', default: '0' })
  chips_before: string;

  @Column({ type: 'bigint', default: '0' })
  chips_bet: string;

  @Column({ type: 'bigint', default: '0' })
  chips_won: string;

  @Column({ type: 'bigint', default: '0' })
  net_gain_loss: string;

  @Column({ type: 'boolean', default: false })
  is_winner: boolean;

  @Column({ type: 'boolean', default: false })
  vpip: boolean;

  @Column({ type: 'boolean', default: false })
  pfr: boolean;

  // ---- Relations ----

  @ManyToOne(() => GameHand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hand_id' })
  hand: GameHand;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
