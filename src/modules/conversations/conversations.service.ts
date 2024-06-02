import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { Conversation } from './schemas/conversation.schema';
import { User } from '@modules/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async createConversation(
    createConversationData: CreateConversationDto,
    user: User,
  ): Promise<Conversation> {
    // user must be a conversation member
    if (!createConversationData.members.includes(user._id.toString())) {
      throw new BadRequestException('Members is invalid');
    }

    // create conversation
    const conversation = await this.conversationModel.create({
      type: createConversationData.type,
    });

    return conversation;
  }
}
