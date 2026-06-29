import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PageAdmin } from './page_admin.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('pages')
export class Page extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'int', default: 0 })
  follower_count: number;

  @Column({ type: 'boolean', default: false })
  auto_reply_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  welcome_message: string;

  @Column({ type: 'json', nullable: true })
  faq_data: any;

  @Column({ type: 'varchar' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---- Relations ----

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => PageAdmin, (pa) => pa.page)
  admins: PageAdmin[];

  @OneToMany(() => Post, (post) => post.page)
  posts: Post[];
}
