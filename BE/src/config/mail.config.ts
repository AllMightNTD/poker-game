import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('mail', (): MailerOptions => {
  const mailHost = process.env.MAIL_HOST || 'smtp.gmail.com';
  const mailPort = parseInt(process.env.MAIL_PORT || '587', 10);
  const mailUser = process.env.MAIL_USER || 'no-reply@yourdomain.com';
  const mailPass = process.env.MAIL_PASS;
  const fromEmail = process.env.MAIL_FROM || mailUser;

  const transport = {
    host: mailHost,
    port: mailPort,
    secure: mailPort === 465, // true for port 465, false for 587
    auth: {
      user: mailUser,
      pass: mailPass,
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
      from: `"${process.env.APP_NAME || 'CG Poker'}" <${fromEmail}>`,
    },
    template: {
      dir: join(process.cwd(), 'src', 'mail', 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
    preview: false, // Turn off preview modal to focus on debug logs
  };
});
