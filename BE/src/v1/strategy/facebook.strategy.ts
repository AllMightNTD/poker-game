import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['public_profile', 'email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user = {
      facebook_id: id,
      email: emails ? emails[0].value : null,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos ? photos[0].value : null,
      accessToken,
    };
    done(null, user);
  }
}
