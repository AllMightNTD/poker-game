import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('search_histories')
export class SearchHistory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  keyword: string;

  @CreateDateColumn()
  created_at: Date;
}
