import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('crawl_logs')
export class CrawlLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // <-- BẮT BUỘC để upsert(['title']) hoạt động
  title: string;

  @Column()
  source_url: string;

  @Column()
  status: 'SUCCESS' | 'FAILED';

  @Column({ type: 'int', default: 0 })
  attempt_count: number; // <-- cột mới

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'varchar', nullable: true })
  blog_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
