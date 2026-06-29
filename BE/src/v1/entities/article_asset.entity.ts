import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleAssetType } from 'src/constants/enums';
import { Article } from './article.entity';

@Entity('article_assets')
export class ArticleAsset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  article_id: string;

  @Column({ type: 'varchar', length: 1000 })
  file_url: string;

  @Column({ type: 'enum', enum: ArticleAssetType })
  file_type: ArticleAssetType;

  @Column({ type: 'int', nullable: true })
  size_bytes: number;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Article, (article) => article.assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;
}
