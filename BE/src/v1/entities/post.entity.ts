import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Audience, PostType, PostStatus } from 'src/constants/enums';
import { User } from './user.entity';
import { Page } from './page.entity';
import { Group } from './group.entity';
import { PostMedia } from './post_media.entity';
import { PostTag } from './post_tag.entity';
import { PostHashtag } from './post_hashtag.entity';
import { Poll } from './poll.entity';
import { Comment } from './comment.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', nullable: true })
  page_id: string;

  @Column({ type: 'varchar', nullable: true })
  group_id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'enum', enum: PostType, default: PostType.TEXT })
  type: PostType;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.APPROVED })
  status: PostStatus;

  @Column({ type: 'enum', enum: Audience })
  audience: Audience;

  @Column({ type: 'json', nullable: true })
  custom_audience_ids: Record<string, any>[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  feeling: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  post_background: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  location_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  location_lng: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  link_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link_title: string;

  @Column({ type: 'text', nullable: true })
  link_description: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  link_image: string;

  @Column({ type: 'varchar', nullable: true })
  parent_post_id: string;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'boolean', default: false })
  is_hidden: boolean;

  @Column({ type: 'boolean', default: false })
  comment_disabled: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  share_count: number;

  @Column({ type: 'int', default: 0 })
  reaction_count: number;

  @Column({ type: 'int', default: 0 })
  comment_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Page, (page) => page.posts, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @ManyToOne(() => Group, (group) => group.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Post, (post) => post.shares, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_post_id' })
  parent_post: Post;

  @OneToMany(() => Post, (post) => post.parent_post)
  shares: Post[];

  @OneToMany(() => PostMedia, (pm) => pm.post)
  media: PostMedia[];

  @OneToMany(() => PostTag, (pt) => pt.post)
  tags: PostTag[];

  @OneToMany(() => PostHashtag, (ph) => ph.post)
  hashtags: PostHashtag[];

  @OneToMany(() => Poll, (poll) => poll.post)
  polls: Poll[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
