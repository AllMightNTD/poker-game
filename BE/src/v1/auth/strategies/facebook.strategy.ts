import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'placeholder',
      clientSecret:
        configService.get<string>('FACEBOOK_APP_SECRET') || 'placeholder',
      callbackURL:
        configService.get<string>('FACEBOOK_CALLBACK_URL') ||
        'http://localhost:3002/api/v1/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const email =
      emails && emails[0] ? emails[0].value : `${profile.id}@facebook.com`;
    const user = {
      facebookId: profile.id,
      email,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos && photos[0] ? photos[0].value : '',
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
