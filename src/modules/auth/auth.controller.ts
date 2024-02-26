import { Body, Controller, Post } from '@nestjs/common';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async login(@Body() loginData: LoginDto) {
    const res = await this.authService.login(loginData);
    return buildSuccessResponse(
      transformObjectToResponse(res, LoginResponseDto),
    );
  }
}
