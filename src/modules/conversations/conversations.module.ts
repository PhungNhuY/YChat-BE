import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { User, UserSchema } from '@modules/users/schemas/user.schema';
import {
  Message,
  MessageSchema,
} from '@modules/messages/schemas/message.schema';
import {
  LastMessage,
  LastMessageSchema,
} from '@modules/messages/schemas/last-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
      {
        name: LastMessage.name,
        schema: LastMessageSchema,
      },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
