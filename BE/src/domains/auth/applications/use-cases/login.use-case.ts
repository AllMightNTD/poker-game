import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/constants/enums';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(loginDto: any) {
    const { emailOrPhone, password, rememberMe = false } = loginDto;

    const user = await this.authRepository.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      throw new HttpException(
        { errorCode: 'EMAIL_NOT_FOUND', message: 'Email không tồn tại' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        { errorCode: 'WRONG_PASSWORD', message: 'Sai mật khẩu' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const cookieExpireDays = rememberMe ? 30 : 1;
    const refreshTokenExpiry = rememberMe ? '30d' : '1d';

    const refreshTokenString = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiry,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + cookieExpireDays);

    const refreshTokenHash = await bcrypt.hash(refreshTokenString, 10);

    await this.authRepository.saveRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
      device_info: 'Unknown Device',
      ip_address: '127.0.0.1',
    });

    delete user.password;

    return {
      user,
      accessToken,
      refreshToken: refreshTokenString,
      cookieExpireDays,
    };
  }
}
