import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SeoMeta } from './seo_meta.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  parent_id: string;

  @Column({ type: 'varchar', nullable: true })
  seo_meta_id: string;

  // ---- Relations ----

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToOne(() => SeoMeta, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'seo_meta_id' })
  seo_meta: SeoMeta;
}
