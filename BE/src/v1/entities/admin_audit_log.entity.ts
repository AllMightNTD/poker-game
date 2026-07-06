import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('admin_audit_logs')
export class AdminAuditLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar' })
  admin_id: string;

  @Index()
  @Column({ type: 'varchar' })
  action: string; 

  @Column({ type: 'varchar' })
  resource: string;

  @Column({ type: 'text', nullable: true })
  old_value: string;

  @Column({ type: 'text', nullable: true })
  new_value: string;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;
}
