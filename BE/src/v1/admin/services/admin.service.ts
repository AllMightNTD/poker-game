import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AdminRole } from 'src/constants/enums';
import { Admin } from '../../entities/admin.entity';
import { AdminRefreshToken } from '../../entities/admin_refresh_token.entity';
import { AdminLoginDto } from '../dto/admin-login.dto';
import { AdminRefreshTokenDto } from '../dto/admin-refresh-token.dto';

@Injectable()
export class AdminService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: AdminLoginDto) {
    const admin = await Admin.findOne({ where: { email: dto.email } });
    if (!admin) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    if (
      admin.role !== AdminRole.ADMIN &&
      admin.role !== AdminRole.SUPER_ADMIN
    ) {
      throw new UnauthorizedException('Invalid admin role');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      is_admin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
    });

    // Tạo DB-backed Refresh Token với RTR
    const plainRefreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(plainRefreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenEntity = new AdminRefreshToken();
    tokenEntity.admin_id = admin.id;
    tokenEntity.token_hash = tokenHash;
    tokenEntity.expires_at = expiresAt;
    await tokenEntity.save();

    const refreshToken = `${tokenEntity.id}.${plainRefreshToken}`;

    return {
      admin_access_token: accessToken,
      admin_refresh_token: refreshToken,
      admin: {
        id: admin.id,
        user_name: admin.user_name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async refreshToken(dto: AdminRefreshTokenDto) {
    const { refreshToken } = dto;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const [tokenId, plainToken] = refreshToken.split('.');
    if (!tokenId || !plainToken) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    const tokenEntity = await AdminRefreshToken.findOne({
      where: { id: tokenId },
      relations: ['admin'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Phát hiện tái sử dụng (Reuse Detection)
    if (tokenEntity.revoked_at !== null) {
      await AdminRefreshToken.update(
        { admin_id: tokenEntity.admin_id, revoked_at: null },
        { revoked_at: new Date() },
      );
      throw new UnauthorizedException(
        'Refresh token has already been used. Revoking all active admin sessions.',
      );
    }

    // Kiểm tra hết hạn
    if (tokenEntity.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Kiểm tra mã băm
    const isHashValid = await bcrypt.compare(
      plainToken,
      tokenEntity.token_hash,
    );
    if (!isHashValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const admin = tokenEntity.admin;
    if (!admin) {
      throw new UnauthorizedException('Admin account not found');
    }

    if (
      admin.role !== AdminRole.ADMIN &&
      admin.role !== AdminRole.SUPER_ADMIN
    ) {
      throw new UnauthorizedException('Invalid admin role');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      is_admin: true,
    };

    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
    });

    // Thực hiện xoay vòng token (RTR)
    tokenEntity.revoked_at = new Date();
    await tokenEntity.save();

    const newPlainRefreshToken = crypto.randomBytes(64).toString('hex');
    const newTokenHash = await bcrypt.hash(newPlainRefreshToken, 10);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const newTokenEntity = new AdminRefreshToken();
    newTokenEntity.admin_id = admin.id;
    newTokenEntity.token_hash = newTokenHash;
    newTokenEntity.expires_at = newExpiresAt;
    await newTokenEntity.save();

    const newRefreshToken = `${newTokenEntity.id}.${newPlainRefreshToken}`;

    return {
      admin_access_token: newAccessToken,
      admin_refresh_token: newRefreshToken,
      admin: {
        id: admin.id,
        user_name: admin.user_name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async getMe(adminId: string) {
    const admin = await Admin.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }
    return {
      id: admin.id,
      user_name: admin.user_name,
      email: admin.email,
      role: admin.role,
    };
  }

  async logout(adminId: string) {
    await AdminRefreshToken.update(
      { admin_id: adminId, revoked_at: null },
      { revoked_at: new Date() },
    );
    return { message: 'Logged out successfully' };
  }
}
