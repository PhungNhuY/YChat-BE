import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthData } from '@utils/types';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { CreateRequestDto } from './dtos/create-request.dto';
import { FriendshipsService } from './friendships.service';
import { buildSuccessResponse } from '@utils/api-response-builder.util';

@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}
  @Get()
  findAll(@UseAuthData() authData: AuthData) {}

  @Post()
  async createRequest(
    @UseAuthData() authData: AuthData,
    @Body() createRequestData: CreateRequestDto,
  ) {
    await this.friendshipsService.createRequest(authData, createRequestData);
    return buildSuccessResponse();
  }

  @Patch()
  changeRequestStatus(@UseAuthData() authData: AuthData) {}
}
