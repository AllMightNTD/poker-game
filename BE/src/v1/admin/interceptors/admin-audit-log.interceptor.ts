import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminAuditLog } from '../../entities/admin_audit_log.entity';
import { Reflector } from '@nestjs/core';
import { AUDIT_ACTION_KEY } from '../decorators/audit-action.decorator';

@Injectable()
export class AdminAuditLogInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    if (req.method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        const admin = req.admin;
        if (admin) {
          const auditMeta = this.reflector.get<{action: string, resource: string}>(AUDIT_ACTION_KEY, context.getHandler());
          const action = auditMeta?.action || req.method;
          const resource = auditMeta?.resource || req.url;

          // Perform non-blocking insert
          AdminAuditLog.insert({
            admin_id: admin.sub,
            action,
            resource,
            old_value: null, 
            new_value: JSON.stringify(req.body),
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
          }).catch(err => {
             console.error('Failed to log admin action:', err);
          });
        }
      }),
    );
  }
}
