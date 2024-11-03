import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dtos/create-message.dto';
import { AuthData, NewMessageData } from '@utils/types';
import { Conversation } from '@modules/conversations/schemas/conversation.schema';
import { MessageQueryDto } from './dtos/message-query.dto';
@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async create(
    conversationId: string,
    createMessageData: CreateMessageDto,
    authData: AuthData,
  ): Promise<NewMessageData> {
    const conversation = await this.conversationModel
      .findOne({
        _id: conversationId,
        deleted_at: null,
        'members.user': authData._id,
      })
      .lean();
    if (!conversation) throw new BadRequestException('Conversation not found');

    let message = await this.messageModel.create({
      conversation: conversationId,
      user: authData._id,
      ...createMessageData,
    });

    message = await message.populate({
      path: 'user',
      match: { deleted_at: null },
      select: 'name avatar',
    });

    return { message: message.toObject(), conversation };
  }

  async findAll(
    conversationId: string,
    query: MessageQueryDto,
    authData: AuthData,
  ) {
    // check valid conversation id
    // user must be a conversation member
    const validConversation = await this.conversationModel.exists({
      deleted_at: null,
      _id: conversationId,
      members: {
        $elemMatch: {
          user: authData._id,
        },
      },
    });
    if (!validConversation)
      throw new BadRequestException('Conversation not found');

    const limit = query.limit || 10;
    const messages = await this.messageModel
      .find({
        conversation: conversationId,
        deleted_at: null,
        ...(query.before && { created_at: { $lt: query.before } }),
      })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
    return messages;
  }
}
