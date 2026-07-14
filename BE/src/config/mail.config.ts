import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('mail', (): MailerOptions => {
  const isMailerSend =
    process.env.MAILERSEND_API_KEY && process.env.MAILERSEND_SMTP_USER;

  const transport = isMailerSend
    ? {
      host: 'smtp.mailersend.net',
      port: 2525,
      secure: false,
      auth: {
        user: process.env.MAILERSEND_SMTP_USER,
        pass: process.env.MAILERSEND_API_KEY,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true,
      logger: true,
    }
    : {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT ? +process.env.MAIL_PORT : 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: true,
      logger: true,
    };

  return {
    transport,
    defaults: {
      from: `"${process.env.APP_NAME || 'No Reply'}" <${process.env.MAIL_FROM || 'no-reply@yourdomain.com'}>`,
    },
    template: {
      dir: join(process.cwd(), 'src', 'mail', 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    preview: true,
  };
});
