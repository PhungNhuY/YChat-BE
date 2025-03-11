import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { refresh_token_public_key } from '@constants/jwt.const';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@modules/users/schemas/user.schema';
import { Model } from 'mongoose';
import { EUserStatus } from '@constants/user.constant';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
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
    const user = await this.userModel
      .findOne({
        _id: payload._id,
        deleted_at: null,
        // The valid token is the one created after validTokenIat
        validTokenIat: {
          $lt: payload.iat,
        },
        status: EUserStatus.ACTIVE,
      })
      .lean();
    if (!user) throw new UnauthorizedException('User not found');
    return payload;
  }

  private static extractJwtFromCookies(req: Request): string | null {
    if (req.cookies && req.cookies['refresh_token']) {
      return req.cookies['refresh_token'];
    }
    return null;
  }
}
