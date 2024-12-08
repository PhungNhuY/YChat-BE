import { EUserStatus } from '@constants/user.constant';
import { Friendship } from '@modules/friendships/schemas/friendship.schema';
import { User } from '@modules/users/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DevService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Friendship')
    private readonly friendshipModel: Model<Friendship>,
  ) {}

  async initDevData() {
    const numberOfUser = 50;

    // create user
    const users = [];
    console.log(`creating ${numberOfUser} users`);
    for (let i = 0; i < numberOfUser; i++) {
      const createdUser = await this.userModel.create({
        email: `user${i}@gmail.com`,
        password: '12345678',
        name: `User ${i}`,
        status: EUserStatus.ACTIVE,
        validTokenIat: Math.round(Date.now() / 1000),
      });
      users.push(createdUser);
    }
    console.log(`created ${users.length} users`);

    // create friendship request
    const friendshipRequests = [];
    console.log(`creating friendship requests`);
    for (let i = 0; i < users.length - 1; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const createdFriendshipRequest = await this.friendshipModel.create({
          sender: users[i]._id,
          receiver: users[j]._id,
        });
        friendshipRequests.push(createdFriendshipRequest);
      }
    }
    console.log(`created ${friendshipRequests.length} friendship requests`);
  }
}
