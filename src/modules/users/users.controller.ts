import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { UsersService } from './users.service';
import {
  buildSuccessResponse,
  transformArrayToResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { UserResponseDto } from './dtos/user-response.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import { AuthData } from '@utils/types';
import { ApiQueryDto } from '@common/api-query.dto';

@Controller('users')
@UseGuards(JwtAccessTokenGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@UseAuthData() authData: AuthData) {
    const profile = await this.usersService.findOne(authData._id);
    return buildSuccessResponse(
      transformObjectToResponse(profile, UserResponseDto),
    );
  }

  @Get()
  async find(
    @Query() apiQueryDto: ApiQueryDto,
    @UseAuthData() authData: AuthData,
  ) {
    const data = await this.usersService.find(apiQueryDto, authData);
    return buildSuccessResponse(
      transformArrayToResponse(data, UserResponseDto),
    );
  }
}
