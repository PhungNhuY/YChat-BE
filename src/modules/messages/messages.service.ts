import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dtos/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async create(createMessageData: CreateMessageDto): Promise<Message> {
    const message = await this.messageModel.create(createMessageData);
    return message;
  }
}
