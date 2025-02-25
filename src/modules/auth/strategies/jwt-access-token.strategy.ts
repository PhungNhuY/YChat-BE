import { access_token_public_key } from '@constants/jwt.const';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // get token from request
      jwtFromRequest: ExtractJwt.fromExtractors([
        // find in cookies
        JwtAccessTokenStrategy.extractJwtFromCookies,
        // find in header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: access_token_public_key,
    });
  }

  // user will be added to request.user
  async validate(payload: any) {
    await this.authService.isTokenValid(payload._id, payload.iat);
    return payload;
  }

  private static extractJwtFromCookies(req: Request): string | null {
    if (req.cookies && req.cookies['access_token']) {
      return req.cookies['access_token'];
    }
    return null;
  }
}
