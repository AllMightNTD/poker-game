import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from 'src/constants/enums';
import { IAuthRepository } from '../../domain/repositories/auth.repository.interface';

@Injectable()
export class ValidateFacebookUserUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(facebookUser: any) {
    const { facebook_id, email, firstName, lastName, picture } = facebookUser;

    let user = await this.authRepository.findUserByFacebookId(facebook_id);

    if (!user && email) {
      user = await this.authRepository.findUserByEmail(email);

      if (user) {
        user.facebook_id = facebook_id;
        await this.authRepository.saveUser(user);
      }
    }

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      user = await this.authRepository.createRegisterTransaction(
        { facebook_id, email, status: UserStatus.ACTIVE, password: randomPassword },
        { full_name: `${firstName} ${lastName}`, username: `fb_${facebook_id}`, avatar_url: picture }
      );
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
