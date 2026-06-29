import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Tag } from './tag.entity';

@Entity('article_tags')
export class ArticleTag extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  article_id: string;

  @PrimaryColumn({ type: 'varchar' })
  tag_id: string;

  // ---- Relations ----

  @ManyToOne(() => Article, (article) => article.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Tag, (tag) => tag.article_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
