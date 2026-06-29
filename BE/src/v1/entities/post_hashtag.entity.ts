import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Hashtag } from './hashtag.entity';

@Entity('post_hashtags')
export class PostHashtag extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  post_id: string;

  @PrimaryColumn({ type: 'varchar' })
  hashtag_id: string;

  // ---- Relations ----

  @ManyToOne(() => Post, (post) => post.hashtags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Hashtag, (hashtag) => hashtag.post_hashtags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hashtag_id' })
  hashtag: Hashtag;
}
