import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('provably_fair_audits')
export class ProvablyFairAudit extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  table_id: string;

  @Column({ type: 'bigint' })
  hand_id: string;

  @Column({ type: 'varchar', length: 64 })
  server_seed_hash: string;

  @Column({ type: 'text' })
  encrypted_server_seed: string;

  @Column({ type: 'varchar', length: 64 })
  auth_tag: string;

  @Column({ type: 'varchar', length: 64 })
  client_seed: string;

  @Column({ type: 'int' })
  nonce: number;

  @Column({ type: 'varchar', length: 64 })
  deck_hash: string;

  @Column({ type: 'varchar', length: 32 })
  algorithm_version: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  revealed_at: Date | null;
}
