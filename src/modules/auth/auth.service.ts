import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/schemas/user.schema';
import { LoginDto } from './dtos/login.dto';
import { verifyPlainContentWithHashedContent } from '@utils/secure.util';
import { JwtService } from '@nestjs/jwt';
import {
  access_token_private_key,
  refresh_token_private_key,
} from '@constants/jwt.const';
import { ConfigService } from '@nestjs/config';
import { EmailsService } from '@modules/emails/emails.service';
import { generateRandomString } from '@utils/random-string.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
  ) {}
  async register(registerData: RegisterDto): Promise<User> {
    const verificationCode = generateRandomString(64);
    const verificationCodeExpiresAt =
      Date.now() +
      this.configService.get<number>('ACTIVATE_EMAIL_TOKEN_EXPIRATION_TIME');
    const newUser = await this.userService.create({
      ...registerData,
      verificationCode,
      verificationCodeExpiresAt,
    });
    await this.emailsService.sendRegistrationConfirmation(
      newUser,
      verificationCode,
    );
    return newUser;
  }

  async login(loginData: LoginDto) {
    const user = await this.userService.findLoginUser(loginData.email);
    if (
      user &&
      verifyPlainContentWithHashedContent(loginData.password, user.password)
    ) {
      // token payload
      const payload = {
        email: user.email,
        _id: user._id,
        status: user.status,
      };

      // access token
      const access_token = this.generateToken(
        payload,
        access_token_private_key,
        this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME'),
      );

      // refresh token
      const refresh_token = this.generateToken(
        payload,
        refresh_token_private_key,
        this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_TIME'),
      );

      return {
        ...user,
        access_token,
        refresh_token,
      };
    }
    throw new UnauthorizedException(['Wrong credential']);
  }

  private generateToken(
    payload: object,
    privateKey: string,
    expiresIn: number,
  ) {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: `${expiresIn}s`,
    });
  }
}
