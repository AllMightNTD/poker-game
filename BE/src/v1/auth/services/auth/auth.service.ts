import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { withTransaction } from 'src/common/helpers/transaction.helper';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../../../entities/refresh_token.entity';
import { User } from '../../../entities/user.entity';
import { Wallet } from '../../../entities/wallet.entity';
import { LoginDto, RefreshTokenDto, RegisterDto } from '../../dto/auth.dto';
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
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, user_name } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { user_name }],
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Wrap in transaction: User + Wallet created atomically.
    // If wallet creation fails, user row is rolled back (no orphaned users).
    const user = await withTransaction(this.dataSource, async (qr) => {
      const newUser = qr.manager.create(User, {
        email,
        user_name,
        password: hashedPassword,
      });
      await qr.manager.save(newUser);

      const wallet = qr.manager.create(Wallet, {
        user_id: newUser.id,
        chips_balance: '50000000', // 50M chips on registration
      });
      await qr.manager.save(wallet);

      return newUser;
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'user_name', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.user_name };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '2h' });

    // Generate Refresh Token
    const plainRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(plainRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

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
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '2h' });

    // Optional: Token Rotation
    const newPlainRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = await bcrypt.hash(newPlainRefreshToken, 10);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

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

  async forgotPassword(_requestPasswordResetDto: RequestPasswordResetDto) {
    // Basic stub, implement full logic if needed
    console.log('_requestPasswordResetDto', _requestPasswordResetDto);
    return { message: 'Reset password link sent to email' };
  }

  async resetPassword(_resetPasswordDto: ResetPasswordDto) {
    // Basic stub, implement full logic if needed
    console.log('_resetPasswordDto', _resetPasswordDto);
    return { message: 'Password reset successfully' };
  }
}
