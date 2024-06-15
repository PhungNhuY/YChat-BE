import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import {
  buildSuccessResponse,
  transformObjectToResponse,
} from '@utils/api-response-builder.util';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessageResponseDto } from './dtos/message-response.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}
  @Post()
  async create(@Body() createMessageData: CreateMessageDto) {
    const message = await this.messageService.create(createMessageData);
    return buildSuccessResponse(
      transformObjectToResponse(message, MessageResponseDto),
    );
  }
}
