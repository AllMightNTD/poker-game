import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/services/mail.service';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(requestPasswordResetDto: any) {
    const { email } = requestPasswordResetDto;

    const user = await this.authRepository.findUserByEmail(email);

    const successMessage = {
      message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn',
    };

    if (!user) {
      return successMessage;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.reset_password_token = hashedToken;
    user.reset_password_expires_at = expiresAt;
    await this.authRepository.saveUser(user);

    await this.mailService.enqueueResetPasswordMail({
      email: user.email,
      resetToken: rawToken,
      name: user.profile?.full_name || 'User',
      resetExpire: expiresAt,
    });

    return successMessage;
  }
}
