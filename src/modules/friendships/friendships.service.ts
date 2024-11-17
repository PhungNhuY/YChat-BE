import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Friendship } from './schemas/friendship.schema';
import { Model } from 'mongoose';
import { AuthData } from '@utils/types';
import { CreateRequestDto } from './dtos/create-request.dto';
import { User } from '@modules/users/schemas/user.schema';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<Friendship>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async createRequest(authData: AuthData, createRequestData: CreateRequestDto) {
    // validate receiver
    const validReceiver = await this.userModel.exists({
      _id: createRequestData.receiver,
      deleted_at: null,
    });
    if (!validReceiver) throw new BadRequestException('Receiver not found');

    await this.friendshipModel.create({
      sender: authData._id,
      receiver: createRequestData.receiver,
      messages: createRequestData.messages,
    });
  }
}
