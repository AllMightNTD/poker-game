import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Hashtag } from './hashtag.entity';

@Entity('article_hashtags')
export class ArticleHashtag extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  article_id: string;

  @PrimaryColumn({ type: 'varchar' })
  hashtag_id: string;

  // ---- Relations ----

  @ManyToOne(() => Article, (article) => article.hashtags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Hashtag, (hashtag) => hashtag.article_hashtags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hashtag_id' })
  hashtag: Hashtag;
}
