import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BookmarkTargetType } from 'src/constants/enums';
import { User } from './user.entity';
import { BookmarkCollection } from './bookmark_collection.entity';

@Entity('bookmarks')
@Unique(['user_id', 'target_type', 'target_id'])
export class Bookmark extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @Column({ type: 'enum', enum: BookmarkTargetType })
  target_type: BookmarkTargetType;

  @Column({ type: 'varchar' })
  target_id: string;

  @Column({ type: 'varchar', nullable: true })
  collection_id: string;

  @CreateDateColumn()
  created_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BookmarkCollection, (collection) => collection.bookmarks, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: BookmarkCollection;
}
