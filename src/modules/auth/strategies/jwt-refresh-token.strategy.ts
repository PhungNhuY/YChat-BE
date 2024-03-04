import { UsersService } from '@modules/users/users.service';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { refresh_token_public_key } from '@constants/jwt.const';
import { Request } from 'express';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshTokenStrategy.extractJwtFromCookies,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: refresh_token_public_key,
    });
  }

  // user will be added to request.user
  async validate(payload: any) {
    try {
      await this.userService.findOne(payload._id);
      return payload;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new UnauthorizedException(
          (error.getResponse() as unknown as any).message,
        );
      } else {
        throw error;
      }
    }
  }

  private static extractJwtFromCookies(req: Request): string | null {
    if (req.cookies && req.cookies['refresh_token']) {
      return req.cookies['refresh_token'];
    }
    return null;
  }
}
