import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleVersionStatus } from 'src/constants/enums';
import { Article } from './article.entity';
import { User } from './user.entity';

@Entity('article_versions')
export class ArticleVersion extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  article_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ type: 'enum', enum: ArticleVersionStatus })
  status: ArticleVersionStatus;

  @Column({ type: 'varchar' })
  created_by: string;

  @Column({ type: 'varchar', nullable: true })
  reviewed_by: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  review_note: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Article, (article) => article.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;
}
