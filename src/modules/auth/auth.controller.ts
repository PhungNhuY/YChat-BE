import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import {
  ApiResponse,
  buildSuccessResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { User } from '@modules/users/schemas/user.schema';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ActivateAccountQueryDto } from './dtos/activate-query.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtRefreshTokenGuard } from 'src/guards/jwt-refresh-token.guard';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { RefreshResponseDto } from './dtos/refresh-response.dto';
import { AuthData } from '@utils/types';
import { FogotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GetUserFromTokenDto } from './dtos/token.dto';
import { UserFromTokenResponseDto } from '@modules/users/dtos/user-from-token-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() registerData: RegisterDto,
  ): Promise<ApiResponse<User>> {
    const newUser = await this.authService.register(registerData);
    return buildSuccessResponse(
      transformObjectToResponse<User>(newUser, UserResponseDto),
    );
  }

  @Post('login')
  async login(
    @Body() loginData: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.authService.login(loginData);

    // set access token to cookie
    response.cookie('access_token', res.access_token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      ...(!!loginData.remember && {
        maxAge:
          this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME') * 1000,
      }),
      domain: this.configService.get<string>('API_HOST'),
      secure: this.configService.get<string>('NODE_EVN') === 'production',
    });

    // set refresh token to cookie
    response.cookie('refresh_token', res.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      ...(!!loginData.remember && {
        maxAge:
          this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_TIME') *
          1000,
      }),
      domain: this.configService.get<string>('API_HOST'),
      secure: this.configService.get<string>('NODE_EVN') === 'production',
    });

    return buildSuccessResponse(
      transformObjectToResponse(res, LoginResponseDto),
    );
  }

  @Post('refresh')
  @UseGuards(JwtRefreshTokenGuard)
  async refresh(
    @UseAuthData() authData: AuthData,
    @Res({ passthrough: true }) response: Response,
  ) {
    const resData = await this.authService.refresh(authData);
    response.cookie('access_token', resData.access_token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge:
        this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME') * 1000,
      domain: this.configService.get<string>('API_HOST'),
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    return buildSuccessResponse(
      transformObjectToResponse(resData, RefreshResponseDto),
    );
  }

  @Post('activate')
  async activate(@Body() activateAccountQueryData: ActivateAccountQueryDto) {
    await this.authService.activate(activateAccountQueryData);

    return buildSuccessResponse();
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // remove access token
    response.cookie('access_token', null, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      domain: this.configService.get<string>('API_HOST'),
      secure: this.configService.get<string>('NODE_EVN') === 'production',
    });

    // remove refresh token
    response.cookie('refresh_token', null, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 0,
      domain: this.configService.get<string>('API_HOST'),
      secure: this.configService.get<string>('NODE_EVN') === 'production',
    });

    return buildSuccessResponse();
  }

  @Post('forgot-password')
  async createForgotPasswordRequest(
    @Body() forgotPasswordData: FogotPasswordDto,
  ) {
    await this.authService.createForgotPasswordRequest(forgotPasswordData);
    return buildSuccessResponse();
  }

  @Get('user-from-token')
  async getUserFromToken(@Query() query: GetUserFromTokenDto) {
    const user = await this.authService.getUserFromToken(query);
    return buildSuccessResponse(
      transformObjectToResponse(user, UserFromTokenResponseDto),
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordData: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordData);
    return buildSuccessResponse();
  }
}
