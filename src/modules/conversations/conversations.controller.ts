import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import {
  buildSuccessResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { ConversationResponseDto } from './dtos/conversation-response.dto';
import { AuthData } from '@utils/types';
import { ApiQueryDto } from '@common/api-query.dto';

@Controller('conversations')
@UseGuards(JwtAccessTokenGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async create(
    @UseAuthData() authData: AuthData,
    @Body() createConversationData: CreateConversationDto,
  ) {
    const conversation = await this.conversationsService.createConversation(
      createConversationData,
      authData,
    );
    return buildSuccessResponse(
      transformObjectToResponse(conversation, ConversationResponseDto),
    );
  }

  @Get()
  async findAll(
    @UseAuthData() authData: AuthData,
    @Query() query: ApiQueryDto,
  ) {
    const conversations = await this.conversationsService.findAll(
      authData,
      query,
    );
    return buildSuccessResponse();
    // transformObjectToResponse(conversations, ConversationResponseDto),
  }
}
