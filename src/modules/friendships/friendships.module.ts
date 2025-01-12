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
import { MessagesModule } from '@modules/messages/messages.module';

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
    ]),
    MessagesModule,
  ],
  providers: [FriendshipsService],
  controllers: [FriendshipsController],
})
export class FriendshipsModule {}
