import { Inject, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(userId: string) {
    await this.authRepository.revokeRefreshTokens(userId);
    return { message: 'Đăng xuất thành công' };
  }
}
