import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/schemas/user.schema';
import { LoginDto } from './dtos/login.dto';
import { comparePlainValueWithHashedValue } from '@utils/hash.util';
import { JwtService } from '@nestjs/jwt';
import {
  access_token_private_key,
  refresh_token_private_key,
} from '@constants/jwt.const';
import { ConfigService } from '@nestjs/config';
import { EmailsService } from '@modules/emails/emails.service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { RefreshResponseDto } from './dtos/refresh-response.dto';
import { AuthData } from '@utils/types';
import { TokenService } from './token.service';
import { mongooseTransaction } from '@common/mongoose-transaction';
import { EUserStatus } from '@constants/user.constant';
import { ActivateAccountQueryDto } from './dtos/activate-query.dto';
import { ETokenType } from '@constants/token.constant';
import { FogotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GetUserFromTokenDto } from './dtos/token.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailsService: EmailsService,
    private readonly tokenService: TokenService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection()
    private readonly connection: Connection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async register(registerData: RegisterDto): Promise<User> {
    let newUser: User;
    let tokenId: string = '';
    let tokenValue: string = '';
    await mongooseTransaction(
      this.connection,
      async (session: ClientSession) => {
        // ------ START TRANSACTION

        // create user
        newUser = await this.userService.create(
          {
            ...registerData,
            validTokenIat: Math.round(Date.now() / 1000),
          },
          session,
        );
        // send confirmation email
        const verificationTokenExpiresAt =
          Date.now() +
          this.configService.get<number>('ACTIVATE_TOKEN_EXPIRATION_TIME');
        [tokenId, tokenValue] = await this.tokenService.createActivationToken(
          newUser._id.toString(),
          verificationTokenExpiresAt,
          session,
        );

        // ------ END TRANSACTION
      },
    );

    await this.emailsService.sendRegistrationConfirmation(
      newUser,
      tokenId,
      tokenValue,
    );
    return newUser;
  }

  async login(loginData: LoginDto) {
    const user = await this.userService.findLoginUser(loginData.email);
    if (
      user &&
      user.status === EUserStatus.ACTIVE &&
      (await comparePlainValueWithHashedValue(
        loginData.password,
        user.password,
      ))
    ) {
      // token payload
      const payload: AuthData = {
        _id: user._id.toString(),
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

  async activate(activateAccountQueryData: ActivateAccountQueryDto) {
    // validate token
    if (
      await this.tokenService.isTokenValid(
        activateAccountQueryData.uid,
        activateAccountQueryData.tid,
        ETokenType.ACTIVATION,
        activateAccountQueryData.tv,
      )
    ) {
      /* token is valid */
      await mongooseTransaction(
        this.connection,
        async (session: ClientSession) => {
          // ------ START TRANSACTION

          // update user status
          await this.userModel.updateOne(
            {
              _id: activateAccountQueryData.uid,
              deleted_at: null,
            },
            {
              status: EUserStatus.ACTIVE,
            },
            {
              session,
            },
          );
          // revoke token
          await this.tokenService.revokeToken(
            activateAccountQueryData.tid,
            session,
          );

          // ------ END TRANSACTION
        },
      );
    } else {
      /* token is invalid */
      throw new BadRequestException('Invalid verification code');
    }
  }

  async refresh(authData: AuthData): Promise<RefreshResponseDto> {
    const payload: AuthData = {
      _id: authData._id,
      status: authData.status,
    };
    const access_token = this.generateToken(
      payload,
      access_token_private_key,
      this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME'),
    );
    const access_token_expires_at =
      Math.round(Date.now() / 1000) +
      this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME');

    return {
      access_token,
      access_token_expires_at,
    };
  }

  async createForgotPasswordRequest(forgotPasswordData: FogotPasswordDto) {
    const user = await this.userModel
      .findOne({
        email: forgotPasswordData.email,
        deleted_at: null,
      })
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // generate token
    const [tokenId, tokenValue] =
      await this.tokenService.createForgotPasswordToken(
        user._id.toString(),
        Date.now() + 12 * 60 * 60 * 1000,
      );

    // send email
    await this.emailsService.sendResetPasswordRequest(
      user,
      tokenId,
      tokenValue,
    );
  }

  async getUserFromToken(getUserFromTokenDto: GetUserFromTokenDto) {
    const token = await this.tokenService.findValidToken(
      getUserFromTokenDto.uid,
      getUserFromTokenDto.tid,
      getUserFromTokenDto.tokenType,
      getUserFromTokenDto.tv,
    );
    if (!token) {
      throw new BadRequestException('Invalid verification code');
    }
    const user = await this.userModel
      .findOne({
        _id: getUserFromTokenDto.uid,
        deleted_at: null,
      })
      .select('email')
      .lean();
    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }
    return user;
  }

  async resetPassword(resetPasswordData: ResetPasswordDto) {
    // validate token
    if (
      !(await this.tokenService.isTokenValid(
        resetPasswordData.uid,
        resetPasswordData.tid,
        ETokenType.FORGOT_PASSWORD,
        resetPasswordData.tv,
      ))
    ) {
      /* token is invalid */
      throw new BadRequestException('Invalid verification code');
    }

    /* token is valid */
    await mongooseTransaction(
      this.connection,
      async (session: ClientSession) => {
        // ------ START TRANSACTION

        // update user password
        await this.userService.updatePassword(
          resetPasswordData.uid,
          resetPasswordData.password,
          session,
        );

        // revoke token
        await this.tokenService.revokeToken(resetPasswordData.tid, session);

        // ------ END TRANSACTION
      },
    );
  }

  async isTokenValid(userId: string, iat: number) {
    const iatCache = await this.cacheManager.get<number>(`iat:${userId}`);
    // found cache
    if (iatCache) {
      return iatCache <= iat;
    }
    // miss cache
    else {
      // find user
      const user = await this.userModel
        .findOne({
          _id: userId,
          deleted_at: null,
          status: EUserStatus.ACTIVE,
        })
        .select('validTokenIat')
        .lean();
      if (!user) throw new UnauthorizedException('User not found');

      // set cache
      await this.cacheManager.set(`iat:${userId}`, user.validTokenIat);

      return user.validTokenIat <= iat;
    }
  }

  private generateToken(
    payload: AuthData,
    privateKey: string,
    expiresIn: number,
  ): string {
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: `${expiresIn}s`,
    });
  }
}
