import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClubMember } from './club_member.entity';
import { User } from './user.entity';

@Entity('clubs')
export class Club extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** 6-char unique invite code (e.g. "PKR7X2") */
  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar' })
  owner_id: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 50 })
  max_members: number;

  /** Override rake rate for all club-only tables */
  @Column({ type: 'numeric', precision: 4, scale: 2, default: 5.0 })
  club_rake_rate: number;

  /** Total credit pool managed by agents */
  @Column({ type: 'bigint', default: '0' })
  credit_pool: string;

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'closed'],
    default: 'active',
  })
  status: string;

  /** Extra config: allow_public_join, min_level, etc. */
  @Column({ type: 'json', nullable: true })
  settings: Record<string, unknown> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => ClubMember, (m) => m.club)
  members: ClubMember[];
}
