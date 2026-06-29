import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { GroupMemberRole, GroupMemberStatus } from 'src/constants/enums';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('group_members')
export class GroupMember extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  group_id: string;

  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: GroupMemberRole,
    default: GroupMemberRole.MEMBER,
  })
  role: GroupMemberRole;

  @Column({
    type: 'enum',
    enum: GroupMemberStatus,
    default: GroupMemberStatus.ACTIVE,
  })
  status: GroupMemberStatus;

  @Column({ type: 'varchar', nullable: true })
  invited_by: string;

  @CreateDateColumn()
  joined_at: Date;

  // ---- Relations ----

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invited_by' })
  inviter: User;
}
