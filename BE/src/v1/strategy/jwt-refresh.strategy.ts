import { ExtractJwt, Strategy } from 'passport-jwt'; // Dòng này là quan trọng!
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub };
  }
}
