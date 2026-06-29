import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity';

@Entity('group_rules')
export class GroupRule extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  group_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  // ---- Relations ----

  @ManyToOne(() => Group, (group) => group.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}
