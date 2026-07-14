import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('mail', (): MailerOptions => {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail =
    process.env.SENDGRID_FROM_EMAIL || 'no-reply@yourdomain.com';

  const transport = {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // Sử dụng TLS qua port 587
    auth: {
      user: 'apikey', // Luôn cố định là 'apikey' đối với SendGrid SMTP
      pass: sendGridApiKey,
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
    preview: false, // Tắt preview modal để tập trung log debug
  };
});
