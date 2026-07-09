import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';

@Injectable()
@Processor('mail-queue') // tên queue phải khớp với registerQueue('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.debug(`Processing job ${job.name} (id: ${job.id})`);

    console.log('Job data', job.data);
    switch (job.name) {
      case 'register':
        this.logger.log(`Sending registration email to ${job.data.email}`);
        return this.sendRegisterMail(job);
      case 'reset-password':
        return this.sendResetPasswordMail(job);

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        throw new Error(`Unhandled job: ${job.name}`);
    }
  }

  private async sendRegisterMail(job: Job<any>) {
    const data = job.data;
    const webUrl = this.configService.get<string>(
      'WEB_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${webUrl}/verify-otp?token=${data.token}&otp=${data.otp}`;

    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: '♠️ CG Poker - Xác Thực Tài Khoản Người Chơi Mới',
        template: 'register',
        context: {
          username: data.username,
          otp: data.otp,
          verificationUrl,
        },
      });

      this.logger.log(`Registration email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send registration email to ${data.email}`,
        error,
      );
      throw error;
    }
  }

  private async sendResetPasswordMail(job: Job<any>) {
    const user = job.data;

    const webUrl = this.configService.get<string>(
      'WEB_URL',
      'http://localhost:3000',
    );
    const expiresIn = user.resetExpire.toLocaleString();

    const url = `${webUrl}/reset-password/${user.resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Đặt lại mật khẩu',
        template: 'reset-password',
        context: {
          url,
          expiresIn,
          name: user.name ?? '',
        },
      });

      this.logger.log(`Reset password email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send reset password email to ${user.email}`,
        error,
      );
      throw error;
    }
  }
}
