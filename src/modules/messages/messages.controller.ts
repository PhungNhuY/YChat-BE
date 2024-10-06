import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { AuthData } from '@utils/types';
import {
  buildSuccessResponse,
  transformArrayToResponse,
} from '@utils/api-response-builder.util';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectIdValidationPipe } from 'src/pipes/objectid-validation.pipe';
import { MessageQueryDto } from './dtos/message-query.dto';
import { MessageResponseDto } from './dtos/message-response.dto';

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAccessTokenGuard)
export class MessagesController {
  constructor(
    private readonly messageService: MessagesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async create(
    @Param('conversationId', new ObjectIdValidationPipe())
    conversationId: string,
    @Body() createMessageData: CreateMessageDto,
    @UseAuthData() authData: AuthData,
  ) {
    const newMessageData = await this.messageService.create(
      conversationId,
      createMessageData,
      authData,
    );
    this.eventEmitter.emit('message.new', newMessageData);
    return buildSuccessResponse();
  }

  @Get()
  async findAll(
    @Param('conversationId', new ObjectIdValidationPipe())
    conversationId: string,
    @Query() query: MessageQueryDto,
    @UseAuthData() authData: AuthData,
  ) {
    const messages = await this.messageService.findAll(
      conversationId,
      query,
      authData,
    );
    return buildSuccessResponse(
      transformArrayToResponse(
        { items: messages, total: messages.length },
        MessageResponseDto,
      ),
    );
  }
}
