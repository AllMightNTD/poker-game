import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(resetPasswordDto: any) {
    const { token, password } = resetPasswordDto;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user =
      await this.authRepository.findUserByResetPasswordToken(hashedToken);
    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    if (
      !user.reset_password_expires_at ||
      user.reset_password_expires_at.getTime() < Date.now()
    ) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expires_at = null;
    await this.authRepository.saveUser(user);

    return {
      message: 'Mật khẩu của bạn đã được đặt lại thành công',
    };
  }
}
