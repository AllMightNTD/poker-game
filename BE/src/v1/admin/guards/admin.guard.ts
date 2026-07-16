import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/admin-roles.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = this.extractTokenFromCookie(request);

    if (!token) {
      token = this.extractTokenFromHeader(request);
    }

    if (!token) {
      throw new UnauthorizedException('Admin token missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      console.log(payload);

      if (!payload.is_admin) {
        throw new ForbiddenException('You are not authorized as an admin');
      }

      request['admin'] = payload;

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException(
          `Require one of roles: ${requiredRoles.join(', ')}`,
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid admin token');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return undefined;

    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.split('=').map((c) => c.trim());
        if (key) acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return cookies['admin_access_token'];
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
