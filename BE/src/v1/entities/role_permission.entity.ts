import {BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  role_id: string;

  @PrimaryColumn({ type: 'varchar' })
  permission_id: string;

  // ---- Relations ----

  @ManyToOne(() => Role, (role) => role.role_permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.role_permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
