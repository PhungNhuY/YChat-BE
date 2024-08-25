import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dtos/create-message.dto';
import { AuthData } from '@utils/types';
import { Conversation } from '@modules/conversations/schemas/conversation.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createMessageData: CreateMessageDto, authData: AuthData) {
    const conversation = await this.conversationModel
      .findOne({
        _id: createMessageData.conversation,
        deleted_at: null,
        members: authData._id,
      })
      .lean();
    if (!conversation) throw new BadRequestException('Conversation not found');
    let message = await this.messageModel.create({
      user: authData._id,
      ...createMessageData,
    });

    message = await message.populate({
      path: 'user',
      match: { deleted_at: null },
      select: 'name avatar',
    });

    this.eventEmitter.emit('message.new', message);
  }
}
