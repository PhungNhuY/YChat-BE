import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Message } from './schemas/message.schema';
import { ClientSession, Connection, HydratedDocument, Model } from 'mongoose';
import { CreateMessageDto } from './dtos/create-message.dto';
import { AuthData, NewMessageData } from '@utils/types';
import { Conversation } from '@modules/conversations/schemas/conversation.schema';
import { MessageQueryDto } from './dtos/message-query.dto';
import { LastMessage } from './schemas/last-message.schema';
import { mongooseTransaction } from '@common/mongoose-transaction';
@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(LastMessage.name)
    private readonly lastMessageModel: Model<LastMessage>,
    @InjectConnection()
    private readonly connection: Connection,
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

    const message = await mongooseTransaction<HydratedDocument<Message>>(
      this.connection,
      async (session: ClientSession) => {
        // ------ START TRANSACTION
        // create message
        let [message] = await this.messageModel.create(
          {
            conversation: conversationId,
            user: authData._id,
            ...createMessageData,
          },
          {
            session,
          },
        );

        // update last message
        await this.writeLastMessage(message, session);

        // populate user
        message = await message.populate({
          path: 'user',
          match: { deleted_at: null },
          select: 'name avatar',
        });
        return message;
        // ------ END TRANSACTION
      },
    );

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

  async writeLastMessage(message: Message, session: ClientSession) {
    await this.lastMessageModel.findOneAndUpdate(
      {
        conversation: message.conversation.toString(),
      },
      {
        message: message._id.toString(),
      },
      {
        upsert: true,
        session,
      },
    );
  }
}
