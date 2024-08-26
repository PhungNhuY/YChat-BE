import { Module } from '@nestjs/common';
import { WSGateway } from './websocket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from '@modules/conversations/schemas/conversation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
    ]),
  ],
  providers: [WSGateway],
})
export class WebsocketModule {}
