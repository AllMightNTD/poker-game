// src/mail/mail.service.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export type ResetPasswordMailData = {
  email: string;
  resetToken: string;
  name: string;
  resetExpire: Date;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('mail-queue') private readonly mailQueue: Queue) {}

  async enqueueResetPasswordMail(data: ResetPasswordMailData) {
    await this.mailQueue.add('reset-password', data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(`Enqueued reset-password mail for ${data.email}`);
  }

  async queueRegisterMail(data: {
    email: string;
    otp: string;
    token: string;
    username: string;
  }) {
    await this.mailQueue.add('register', data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(`Enqueued registration mail for ${data.email}`);
  }
}
