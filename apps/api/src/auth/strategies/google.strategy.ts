import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, private readonly authService: AuthService) {
    super({
      clientID: config.get<string>('google.clientId') ?? 'unconfigured',
      clientSecret: config.get<string>('google.clientSecret') ?? 'unconfigured',
      callbackURL: config.get<string>('google.callbackUrl') ?? 'http://localhost:3001/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      // Ne faire confiance qu'à un email que Google affirme lui-même vérifié,
      // avant d'autoriser AuthService à lier ce compte par correspondance d'email.
      emailVerified: profile.emails?.[0]?.verified ?? false,
      firstName: profile.name?.givenName ?? profile.displayName,
      lastName: profile.name?.familyName ?? '',
      avatarUrl: profile.photos?.[0]?.value,
    });
    done(null, user);
  }
}
