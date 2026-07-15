import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity('crawl_logs')
export class CrawlLog extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  source_url: string;

  @Column({ type: 'varchar', length: 50 })
  status: 'SUCCESS' | 'FAILED';

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  blog_id: string;

  @ManyToOne(() => Blog, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'blog_id' })
  blog: Blog;

  @CreateDateColumn()
  processed_at: Date;
}
