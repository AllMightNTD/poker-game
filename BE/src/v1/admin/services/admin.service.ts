import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminRole } from 'src/constants/enums';
import { Admin } from '../../entities/admin.entity';
import { AdminLoginDto } from '../dto/admin-login.dto';

@Injectable()
export class AdminService {
  constructor(private readonly jwtService: JwtService) { }

  async login(dto: AdminLoginDto) {
    const admin = await Admin.findOne({ where: { email: dto.email } });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In production, use bcrypt or argon2 to compare hashed passwords
    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate admin role
    if (admin.role !== AdminRole.ADMIN && admin.role !== AdminRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Invalid admin role');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      is_admin: true,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      admin: {
        id: admin.id,
        user_name: admin.user_name,
        email: admin.email,
        role: admin.role,
      }
    };
  }
}
