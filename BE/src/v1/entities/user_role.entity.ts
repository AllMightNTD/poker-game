import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  user_id: string;

  @PrimaryColumn({ type: 'varchar' })
  role_id: string;

  // ---- Relations ----

  @ManyToOne(() => User, (user) => user.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
