import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthData } from 'src/decorators/auth-data.decorator';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import {
  buildSuccessResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { UserResponseDto } from './dtos/user-response.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';

@Controller('users')
@UseGuards(JwtAccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@AuthData() user: User) {
    const profile = await this.usersService.findOne(user._id.toString());
    return buildSuccessResponse(
      transformObjectToResponse(profile, UserResponseDto),
    );
  }
}
