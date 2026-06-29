import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermission } from './role_permission.entity';
import { UserRole } from './user_role.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  // ---- Relations ----

  @OneToMany(() => UserRole, (ur) => ur.role)
  user_roles: UserRole[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  role_permissions: RolePermission[];
}
