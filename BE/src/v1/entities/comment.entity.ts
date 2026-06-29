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
import { CommentType } from 'src/constants/enums';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  post_id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'varchar', nullable: true })
  parent_id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'enum', enum: CommentType, default: CommentType.TEXT })
  type: CommentType;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  sticker_url: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  media_url: string;

  @Column({ type: 'int', default: 0 })
  reaction_count: number;

  @Column({ type: 'int', default: 0 })
  reply_count: number;

  @Column({ type: 'boolean', default: false })
  is_hidden: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent_comment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent_comment)
  replies: Comment[];

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
