import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
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

  async login(dto: AdminLoginDto, ipAddress?: string, deviceInfo?: string) {
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
      throw new UnauthorizedException(
        'Bạn không có quyền truy cập vào hệ thống',
      );
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
    tokenEntity.ip_address = ipAddress;
    tokenEntity.device_info = deviceInfo;
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

  async refreshToken(
    dto: AdminRefreshTokenDto,
    ipAddress?: string,
    deviceInfo?: string,
  ) {
    const { refreshToken } = dto;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    const [tokenId, plainToken] = refreshToken.split('.');
    if (!tokenId || !plainToken) {
      throw new UnauthorizedException('Định dạng refresh token không đúng');
    }

    const tokenEntity = await AdminRefreshToken.findOne({
      where: { id: tokenId },
      relations: ['admin'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    // Phát hiện tái sử dụng (Reuse Detection)
    if (tokenEntity.revoked_at !== null) {
      await AdminRefreshToken.update(
        { admin_id: tokenEntity.admin_id, revoked_at: null },
        { revoked_at: new Date() },
      );
      throw new UnauthorizedException(
        'Refresh token đã được sử dụng. Thu hồi tất cả phiên admin đang hoạt động.',
      );
    }

    // Kiểm tra hết hạn
    if (tokenEntity.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    // Kiểm tra mã băm
    const isHashValid = await bcrypt.compare(
      plainToken,
      tokenEntity.token_hash,
    );
    if (!isHashValid) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const admin = tokenEntity.admin;
    if (!admin) {
      throw new UnauthorizedException('Tài khoản admin không tồn tại');
    }

    if (
      admin.role !== AdminRole.ADMIN &&
      admin.role !== AdminRole.SUPER_ADMIN
    ) {
      throw new UnauthorizedException('Role không hợp lệ');
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
    newTokenEntity.ip_address = ipAddress;
    newTokenEntity.device_info = deviceInfo;
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
      throw new UnauthorizedException('Tài khoản admin không tồn tại');
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
    return { message: 'Đăng xuất thành công' };
  }

  async getActiveSessions(adminId: string) {
    return AdminRefreshToken.createQueryBuilder('art')
      .where('art.admin_id = :adminId', { adminId })
      .andWhere('art.revoked_at IS NULL')
      .andWhere('art.expires_at > :now', { now: new Date() })
      .orderBy('art.created_at', 'DESC')
      .getMany();
  }

  async revokeSession(adminId: string, sessionId: string) {
    const result = await AdminRefreshToken.update(
      { id: sessionId, admin_id: adminId, revoked_at: null },
      { revoked_at: new Date() },
    );
    if (result.affected === 0) {
      throw new NotFoundException(
        'Phiên làm việc không tồn tại hoặc đã bị thu hồi',
      );
    }
    return { success: true };
  }
}
