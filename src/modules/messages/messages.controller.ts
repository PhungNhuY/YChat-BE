import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { JwtAccessTokenGuard } from 'src/guards/jwt-access-token.guard';
import { UseAuthData } from 'src/decorators/use-auth-data.decorator';
import { AuthData } from '@utils/types';
import { buildSuccessResponse } from '@utils/api-response-builder.util';

@Controller('messages')
@UseGuards(JwtAccessTokenGuard)
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  @Post()
  async create(
    @Body() createMessageData: CreateMessageDto,
    @UseAuthData() authData: AuthData,
  ) {
    await this.messageService.create(createMessageData, authData);
    return buildSuccessResponse();
  }
}
