import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import {
  buildSuccessResponse,
  transformArrayToResponse,
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
  async lastConversations(
    @UseAuthData() authData: AuthData,
    @Query() query: ApiQueryDto,
  ) {
    const data = await this.conversationsService.lastConversations(
      authData,
      query,
    );
    return buildSuccessResponse(
      transformArrayToResponse(data, ConversationResponseDto),
    );
  }

  @Get(':conversationId')
  async findOne(
    @Param('conversationId') conversationId: string,
    @UseAuthData() authData: AuthData,
  ) {
    const conversation = await this.conversationsService.findOne(
      conversationId,
      authData,
    );
    return buildSuccessResponse(
      transformObjectToResponse(conversation, ConversationResponseDto),
    );
  }
}
