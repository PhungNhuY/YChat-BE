import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { AuthData } from 'src/decorators/auth-data.decorator';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { User } from '@modules/users/schemas/user.schema';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import {
  buildSuccessResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { ConversationResponseDto } from './dtos/conversation-response.dto';

@Controller('conversations')
@UseGuards(JwtAccessTokenGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async create(
    @AuthData() user: User,
    @Body() createConversationData: CreateConversationDto,
  ) {
    const conversation = await this.conversationsService.createConversation(
      createConversationData,
      user,
    );
    return buildSuccessResponse(
      transformObjectToResponse(conversation, ConversationResponseDto),
    );
  }
}
