import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext): {
    req: Record<string, any>;
    res: Record<string, any>;
  } {
    if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      const headers = client.handshake?.headers || {};
      const xForwardedFor = headers['x-forwarded-for'];
      const clientIp =
        typeof xForwardedFor === 'string'
          ? xForwardedFor.split(',')[0].trim()
          : client.handshake?.address ||
          client.conn?.remoteAddress ||
          '127.0.0.1';

      const req = {
        ...client,
        ip: clientIp,
      };
      return {
        req,
        res: {
          header: () => { }, // Mock header method to prevent "res.header is not a function"
        },
      };
    }
    return super.getRequestResponse(context);
  }
}
