import { Module } from '@nestjs/common';
import { DevService } from './dev.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchemaFactory } from '@modules/users/schemas/user.schema';
import {
  Friendship,
  FriendshipSchema,
} from '@modules/friendships/schemas/friendship.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: UserSchemaFactory,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Friendship.name,
        schema: FriendshipSchema,
      },
    ]),
  ],
  providers: [DevService],
})
export class DevModule {}
