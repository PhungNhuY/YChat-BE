import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthData } from '@utils/types';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { CreateRequestDto } from './dtos/create-request.dto';
import { FriendshipsService } from './friendships.service';
import {
  buildSuccessResponse,
  transformArrayToResponse,
} from '@utils/api-response-builder.util';
import { changeRequestStatusDto } from './dtos/change-request-status.dto';
import { ApiQueryDto } from '@common/api-query.dto';
import { FriendshipResponseDto } from './dtos/friendship-response.dto';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}
  @Get()
  async getFriends(
    @UseAuthData() authData: AuthData,
    @Query() query: ApiQueryDto,
  ) {
    const data = await this.friendshipsService.getFriends(authData, query);
    return buildSuccessResponse(
      transformArrayToResponse(data, FriendshipResponseDto),
    );
  }

  @Get('requests/send')
  async getSendRequests(
    @UseAuthData() authData: AuthData,
    @Query() query: ApiQueryDto,
  ) {
    const data = await this.friendshipsService.getSendRequests(authData, query);
    return buildSuccessResponse(
      transformArrayToResponse(data, FriendshipResponseDto),
    );
  }

  @Get('requests/received')
  async getReceivedRequests(
    @UseAuthData() authData: AuthData,
    @Query() query: ApiQueryDto,
  ) {
    const data = await this.friendshipsService.getReceivedRequests(
      authData,
      query,
    );
    return buildSuccessResponse(
      transformArrayToResponse(data, FriendshipResponseDto),
    );
  }

  @Post()
  async createRequest(
    @UseAuthData() authData: AuthData,
    @Body() createRequestData: CreateRequestDto,
  ) {
    await this.friendshipsService.createRequest(authData, createRequestData);
    return buildSuccessResponse();
  }

  @Patch(':friendshipId')
  async changeRequestStatus(
    @UseAuthData() authData: AuthData,
    @Param('friendshipId') friendshipId: string,
    @Query() q: changeRequestStatusDto,
  ) {
    await this.friendshipsService.changeRequestStatus(
      authData,
      friendshipId,
      q.status,
    );

    return buildSuccessResponse();
  }
}
