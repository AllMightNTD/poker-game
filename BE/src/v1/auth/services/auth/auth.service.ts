import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { withTransaction } from 'src/common/helpers/transaction.helper';
import { UserStatus } from 'src/constants/enums';
import { MailService } from 'src/mail/services/mail.service';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../../../entities/refresh_token.entity';
import { User } from '../../../entities/user.entity';
import { Wallet } from '../../../entities/wallet.entity';
import { PokerStateService } from '../../../services/poker-state.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  VerifyOtpDto,
} from '../../dto/auth.dto';
import { RequestPasswordResetDto } from '../../dto/request-reset-password.dto';
import { ResetPasswordDto } from '../../dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly pokerStateService: PokerStateService,
    private readonly configService: ConfigService,
  ) { }

  async generateAndSendOtp(user: User): Promise<string> {
    const redis = this.pokerStateService.getRedisClient();

    // Check if email is currently blocked
    const isBlocked = await redis.get(`otp:block:${user.email}`);
    if (isBlocked) {
      throw new BadRequestException(
        'Tài khoản bị tạm khóa 15 phút do nhập sai OTP quá 5 lần.',
      );
    }

    // Check if cooldown is active (60 seconds)
    const cooldown = await redis.get(`otp:cooldown:${user.email}`);
    if (cooldown) {
      throw new BadRequestException(
        'Vui lòng đợi 60 giây trước khi yêu cầu gửi lại OTP.',
      );
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate JWT token containing the email (expires in 15m)
    const token = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '15m' },
    );

    // Save state in Redis
    await redis.set(`otp:code:${user.email}`, otp, 'EX', 900); // 15m expiration
    await redis.set(`otp:token:${user.email}`, token, 'EX', 900); // 15m expiration
    await redis.set(`otp:cooldown:${user.email}`, '1', 'EX', 60); // 60s cooldown
    await redis.del(`otp:attempts:${user.email}`); // Reset attempts

    // Queue registration email
    await this.mailService.queueRegisterMail({
      email: user.email,
      otp,
      token,
      username: user.user_name,
    });

    return token;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, user_name } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { user_name }],
    });

    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE) {
        throw new BadRequestException('Email or username already exists');
      }

      // For INACTIVE user, update credentials and send new OTP
      existingUser.password = await bcrypt.hash(password, 10);
      existingUser.user_name = user_name;
      await this.userRepository.save(existingUser);

      const token = await this.generateAndSendOtp(existingUser);

      return {
        message:
          'Tài khoản chưa được kích hoạt. Mã xác thực mới đã được gửi tới email của bạn.',
        token,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          user_name: existingUser.user_name,
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Wrap in transaction: User + Wallet created atomically.
    const user = await withTransaction(this.dataSource, async (qr) => {
      const newUser = qr.manager.create(User, {
        email,
        user_name,
        password: hashedPassword,
        status: UserStatus.INACTIVE, // default status — activated by OTP
      });
      await qr.manager.save(newUser);

      const wallet = qr.manager.create(Wallet, {
        user_id: newUser.id,
        chips_balance: '50000000', // 50M chips on registration
      });
      await qr.manager.save(wallet);

      return newUser;
    });

    const token = await this.generateAndSendOtp(user);

    return {
      message:
        'Đăng ký tài khoản thành công. Vui lòng xác thực mã OTP gửi tới email của bạn.',
      token,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
      },
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { token, otp, email: dtoEmail } = verifyOtpDto;

    let email = dtoEmail;

    if (token) {
      let payload: any;
      try {
        payload = this.jwtService.verify(token);
      } catch {
        throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
      }

      email = payload.email;
      if (!email) {
        throw new BadRequestException('Token không hợp lệ.');
      }
    }

    if (!email) {
      throw new BadRequestException(
        'Vui lòng cung cấp email hoặc token xác thực.',
      );
    }

    const redis = this.pokerStateService.getRedisClient();

    // Check if email is currently blocked
    const isBlocked = await redis.get(`otp:block:${email}`);
    if (isBlocked) {
      throw new BadRequestException(
        'Tài khoản bị tạm khóa 15 phút do nhập sai OTP quá 5 lần.',
      );
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }

    if (user.status === UserStatus.ACTIVE) {
      return {
        message: 'Tài khoản đã được xác thực trước đó. Vui lòng đăng nhập.',
        alreadyVerified: true,
      };
    }

    // Verify token matches current active token in Redis if provided
    if (token) {
      const activeToken = await redis.get(`otp:token:${email}`);
      if (activeToken !== token) {
        throw new BadRequestException(
          'Token xác thực đã hết hạn hoặc đã bị hủy do yêu cầu mới.',
        );
      }
    }

    const activeOtp = await redis.get(`otp:code:${email}`);
    console.log('--- OTP Verify ---', {
      inputOtp: otp,
      inputOtpType: typeof otp,
      activeOtp,
      activeOtpType: typeof activeOtp,
      email,
    });
    if (!activeOtp) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu.',
      );
    }

    if (otp === activeOtp) {
      // Correct OTP
      user.status = UserStatus.ACTIVE;
      await this.userRepository.save(user);

      // Clean up Redis keys
      await redis.del(`otp:code:${email}`);
      await redis.del(`otp:token:${email}`);
      await redis.del(`otp:attempts:${email}`);

      return {
        message: 'Xác thực tài khoản thành công! Chúc bạn chơi game vui vẻ.',
      };
    } else {
      // Incorrect OTP: atomic increment
      const attempts = await redis.incr(`otp:attempts:${email}`);
      await redis.expire(`otp:attempts:${email}`, 900); // 15m expiration

      if (attempts >= 5) {
        await redis.set(`otp:block:${email}`, '1', 'EX', 900); // block for 15m
        await redis.del(`otp:code:${email}`);
        await redis.del(`otp:token:${email}`);
        await redis.del(`otp:attempts:${email}`);
        throw new BadRequestException(
          'Bạn đã nhập sai OTP quá 5 lần. Tài khoản bị tạm khóa 15 phút.',
        );
      }

      throw new BadRequestException(
        `Mã OTP không chính xác. Bạn còn ${5 - attempts} lần nhập.`,
      );
    }
  }

  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Tài khoản đã được xác thực trước đó.');
    }

    const redis = this.pokerStateService.getRedisClient();

    // Check if email is currently blocked
    const isBlocked = await redis.get(`otp:block:${email}`);
    if (isBlocked) {
      throw new BadRequestException(
        'Tài khoản đang bị khóa 15 phút do nhập sai OTP quá 5 lần.',
      );
    }

    // Check cooldown
    const cooldown = await redis.get(`otp:cooldown:${email}`);
    if (cooldown) {
      throw new BadRequestException(
        'Vui lòng đợi 60 giây trước khi yêu cầu gửi lại OTP.',
      );
    }

    const token = await this.generateAndSendOtp(user);

    return {
      message: 'Mã OTP mới đã được gửi tới email của bạn.',
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'user_name', 'password', 'status'],
    });

    const redis = this.pokerStateService.getRedisClient();
    const lockoutKey = `lockout:${email}`;
    const isLocked = await redis.get(lockoutKey);
    if (isLocked) {
      throw new UnauthorizedException(
        'Tài khoản bị tạm khóa 15 phút do đăng nhập sai quá nhiều lần.',
      );
    }

    if (!user) {
      throw new UnauthorizedException('Player không tồn tại');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const attemptsKey = `login_attempts:${email}`;
      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 900); // 15 mins

      if (attempts >= 5) {
        await redis.set(lockoutKey, '1', 'EX', 900); // Lock for 15 mins
        await redis.del(attemptsKey);
        throw new UnauthorizedException(
          'Tài khoản bị tạm khóa 15 phút do đăng nhập sai quá nhiều lần.',
        );
      }
      throw new UnauthorizedException(
        `Sai mật khẩu. Bạn còn ${5 - attempts} lần thử.`,
      );
    }

    // Reset attempts on successful login
    await redis.del(`login_attempts:${email}`);

    const payload = { sub: user.id, username: user.user_name };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate Refresh Token
    const plainRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(plainRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    const refreshTokenEntity = this.refreshTokenRepository.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      access_token: accessToken,
      refresh_token: `${refreshTokenEntity.id}.${plainRefreshToken}`, // Send ID and plain token
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    // Refresh token format: uuid.plaintext
    const [tokenId, plainToken] = refreshToken.split('.');

    if (!tokenId || !plainToken) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { id: tokenId, user: { id: undefined } }, // Just ID is enough to fetch
      relations: ['user'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (tokenEntity.revoked_at || tokenEntity.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const isTokenValid = await bcrypt.compare(
      plainToken,
      tokenEntity.token_hash,
    );
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = tokenEntity.user;
    const payload = { sub: user.id, username: user.user_name };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Optional: Token Rotation
    const newPlainRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = await bcrypt.hash(newPlainRefreshToken, 10);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    // Update existing token or create new one and revoke old (for now we update it for simplicity)
    tokenEntity.token_hash = newTokenHash;
    tokenEntity.expires_at = newExpiresAt;
    await this.refreshTokenRepository.save(tokenEntity);

    return {
      access_token: newAccessToken,
      refresh_token: `${tokenEntity.id}.${newPlainRefreshToken}`,
    };
  }

  async logout(userId: string) {
    // Ideally, revoke all refresh tokens for the user
    await this.refreshTokenRepository.update(
      { user_id: userId, revoked_at: null },
      { revoked_at: new Date() },
    );
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    const redis = this.pokerStateService.getRedisClient();

    // Cooldown check: 60s
    const cooldown = await redis.get(`reset:cooldown:${email}`);
    if (cooldown) {
      throw new BadRequestException(
        'Vui lòng đợi 60 giây trước khi yêu cầu liên kết mới.',
      );
    }

    const user = await this.userRepository.findOne({ where: { email } });

    // Set cooldown
    await redis.set(`reset:cooldown:${email}`, '1', 'EX', 60);

    if (!user) {
      throw new UnauthorizedException('Địa chỉ email không tồn tại');
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const resetExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Store in Redis
    const metadata = JSON.stringify({ email: user.email, userId: user.id });
    await redis.set(`reset:token:${token}`, metadata, 'EX', 900); // 15m

    // Enqueue mail
    await this.mailService.enqueueResetPasswordMail({
      email: user.email,
      resetToken: token,
      name: user.user_name,
      resetExpire,
    });

    return {
      message:
        'Nếu địa chỉ email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    const redis = this.pokerStateService.getRedisClient();

    // Fetch token from Redis
    const tokenDataStr = await redis.get(`reset:token:${token}`);
    if (!tokenDataStr) {
      throw new BadRequestException(
        'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.',
      );
    }

    let tokenData: { email: string; userId: string };
    try {
      tokenData = JSON.parse(tokenDataStr);
    } catch {
      throw new BadRequestException(
        'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: tokenData.userId },
    });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    await this.userRepository.save(user);

    // Invalidate all active sessions (revoked_at refresh tokens)
    await this.refreshTokenRepository.update(
      { user_id: user.id, revoked_at: null },
      { revoked_at: new Date() },
    );

    // Clean up Redis token
    await redis.del(`reset:token:${token}`);

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }
}
