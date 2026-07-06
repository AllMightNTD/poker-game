import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isHttpException = exception instanceof HttpException;

    const rawResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const message =
      typeof rawResponse === 'string'
        ? rawResponse
        : (rawResponse as any)?.message || 'Internal server error';

    const error =
      typeof rawResponse === 'object' ? (rawResponse as any)?.error : 'Error';

    // ✅ Propagate errorCode if present (used for field-level FE validation)
    const errorCode =
      typeof rawResponse === 'object'
        ? (rawResponse as any)?.errorCode
        : undefined;

    const requestId = request.headers['x-request-id'] || randomUUID();

    // 🚫 Ignore noise
    const isFavicon = request.url === '/favicon.ico';
    const isNotFound = exception instanceof NotFoundException;

    // 🧱 Structured log
    const logPayload = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: status,
      timestamp: new Date().toISOString(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      message,
      error,
    };

    // 🎯 Log theo level
    if (!isFavicon) {
      if (status >= 500) {
        this.logger.error(JSON.stringify(logPayload), exception.stack);
      } else if (!isNotFound) {
        this.logger.warn(JSON.stringify(logPayload));
      }
    }

    // 📤 Response trả về client (clean, không leak info)
    response.status(status).json({
      requestId,
      statusCode: status,
      timestamp: logPayload.timestamp,
      path: request.url,
      ...(errorCode ? { errorCode } : {}),
      message: status >= 500 ? 'Internal server error' : message,
    });
  }
}
