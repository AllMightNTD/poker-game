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
      const req = {
        ...client,
        ip:
          client.handshake?.address ||
          client.conn?.remoteAddress ||
          '127.0.0.1',
      };
      return {
        req,
        res: {
          header: () => {}, // Mock header method to prevent "res.header is not a function"
        },
      };
    }
    return super.getRequestResponse(context);
  }
}
