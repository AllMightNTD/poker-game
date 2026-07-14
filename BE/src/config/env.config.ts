import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function maskSensitiveValue(value: string): string {
  return value ? '***' : 'Not Set';
}

export function logEnvironmentVariables(configService: ConfigService): void {
  const logger = new Logger('EnvironmentVariables');

  logger.log('===== ENVIRONMENT VARIABLES =====');

  logger.log(`# DB Config`);
  logger.log(`DB_HOST: ${configService.get('DB_HOST')}`);
  logger.log(`DB_USERNAME: ${configService.get('DB_USERNAME')}`);
  logger.log(`DB_PORT: ${configService.get('DB_PORT')}`);
  logger.log(
    `DB_PASSWORD: ${maskSensitiveValue(configService.get('DB_PASSWORD'))}`,
  );
  logger.log(`DB_DATABASE: ${configService.get('DB_DATABASE')}`);

  logger.log(`# JWT Config`);
  logger.log(
    `JWT_ACCESS_TOKEN_SECRET: ${maskSensitiveValue(configService.get('JWT_ACCESS_TOKEN_SECRET'))}`,
  );
  logger.log(
    `JWT_ACCESS_TOKEN_EXPIRES_IN: ${configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')}`,
  );
  logger.log(
    `JWT_REFRESH_TOKEN_SECRET: ${configService.get('JWT_REFRESH_TOKEN_SECRET')}`,
  );
  logger.log(
    `JWT_REFRESH_TOKEN_EXPIRES_IN: ${configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')}`,
  );
  logger.log(
    `JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN: ${configService.get('JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN')}`,
  );

  logger.log(`# TIMEZONE`);
  logger.log(`TIMEZONE: ${configService.get('TIMEZONE')}`);

  logger.log(`# AWS Config`);
  logger.log(`AWS_S3_REGION: ${configService.get('AWS_S3_REGION')}`);
  logger.log(`AWS_S3_BUCKET: ${configService.get('AWS_S3_BUCKET')}`);
  logger.log(
    `AWS_S3_SIGNATURE_VERSION: ${configService.get('AWS_S3_SIGNATURE_VERSION')}`,
  );
  logger.log(`AWS_S3_ACL: ${configService.get('AWS_S3_ACL')}`);
  logger.log(
    `AWS_ACCESS_KEY_ID: ${maskSensitiveValue(configService.get('AWS_ACCESS_KEY_ID'))}`,
  );
  logger.log(
    `AWS_S3_SIGNED_URL_EXPIRY: ${configService.get('AWS_S3_SIGNED_URL_EXPIRY')}`,
  );
  logger.log(
    `AWS_S3_FOLDER_UPLOAD_TMP: ${configService.get('AWS_S3_FOLDER_UPLOAD_TMP')}`,
  );
  logger.log(
    `AWS_S3_FOLDER_UPLOAD: ${configService.get('AWS_S3_FOLDER_UPLOAD')}`,
  );
  logger.log(`AWS_S3_PUBLIC_URL: ${configService.get('AWS_S3_PUBLIC_URL')}`);
  logger.log(
    `AWS_SECRET_ACCESS_KEY: ${maskSensitiveValue(configService.get('AWS_SECRET_ACCESS_KEY'))}`,
  );

  logger.log('=================================');
}
