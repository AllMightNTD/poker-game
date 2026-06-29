import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { DataSource } from 'typeorm';
import { UserRole } from '../entities/user_role.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;

    if (!userPayload || !userPayload.sub) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Query user roles and permissions
    const userRoles = await this.dataSource.getRepository(UserRole).find({
      where: { user_id: userPayload.sub },
      relations: [
        'role',
        'role.role_permissions',
        'role.role_permissions.permission',
      ],
    });

    if (!userRoles || userRoles.length === 0) {
      throw new ForbiddenException('User has no roles assigned');
    }

    const userPermissions = new Set<string>();
    for (const ur of userRoles) {
      if (ur.role && ur.role.role_permissions) {
        for (const rp of ur.role.role_permissions) {
          if (rp.permission) {
            userPermissions.add(rp.permission.code);
          }
        }
      }
    }

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
