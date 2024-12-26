import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';
import { User, UserSchema } from '@modules/users/schemas/user.schema';
import {
  Conversation,
  ConversationSchema,
} from '@modules/conversations/schemas/conversation.schema';
import {
  Message,
  MessageSchema,
} from '@modules/messages/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Friendship.name,
        schema: FriendshipSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Conversation.name,
        schema: ConversationSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [FriendshipsService],
  controllers: [FriendshipsController],
})
export class FriendshipsModule {}
