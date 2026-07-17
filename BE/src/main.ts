import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import * as express from 'express';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exceptions/http.exception.filter';
import { XssValidationPipe } from './common/pipes/xss-validation.pipe';
import { logEnvironmentVariables } from './config/env.config';
import { flattenValidationErrors } from './global-enum';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { config } from './v1/swagger/config';
import { corsOriginFn } from './config/cors.config';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = process.env.APP_ROUTE_PREFIX || 'api';
  const port = +process.env.APP_PORT || +process.env.PORT || 3001;
  const host = process.env.APP_HOST || 'localhost';
  const protocol = process.env.APP_PROTOCOL || 'http';
  const url = `${protocol}://${host}:${port}/${prefix}`;

  app.enableCors({
    origin: corsOriginFn,
    credentials: true,
  });

  app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', 'public/uploads')),
  );

  app.setGlobalPrefix(prefix);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(
    new XssValidationPipe(),
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const flattenedErrors = flattenValidationErrors(validationErrors);
        return new BadRequestException(flattenedErrors);
      },
      whitelist: true,
    }),
  );

  app.use(helmet());

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const configTest = app.get(ConfigService);

  logEnvironmentVariables(configTest);

  await app
    .listen(port, '0.0.0.0')
    .then(() => console.warn(`WELCOME, YOUR API IS READY ON URL: ${url}`))
    .catch((err) => console.error(err, 'Application is crashed'));
}
bootstrap();
