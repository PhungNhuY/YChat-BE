import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { Conversation, EConversationType } from './schemas/conversation.schema';
import { User } from '@modules/users/schemas/user.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AuthData } from '@utils/types';
import { ApiQueryDto } from '@common/api-query.dto';
import { MultiItemsResponse } from '@utils/api-response-builder.util';
import { Message } from '@modules/messages/schemas/message.schema';
import { EMemberRole, Member } from './schemas/member.schema';
import { LastMessage } from '@modules/messages/schemas/last-message.schema';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    @InjectModel(LastMessage.name)
    private readonly lastMessageModel: Model<LastMessage>,
  ) {}

  async createConversation(
    createConversationData: CreateConversationDto,
    authData: AuthData,
  ): Promise<Conversation> {
    // user must be a conversation member
    if (!createConversationData.members.includes(authData._id)) {
      throw new BadRequestException('Members is invalid');
    }

    // check valid users
    const numOfValidUsers = await this.userModel.countDocuments({
      deleted_at: null,
      _id: { $in: createConversationData.members },
    });
    if (numOfValidUsers !== createConversationData.members.length) {
      throw new BadRequestException('Members is invalid');
    }

    // one-to-one conversation must be unique
    if (createConversationData.type === EConversationType.ONE_TO_ONE) {
      const conversationExisted = await this.conversationModel.exists({
        type: EConversationType.ONE_TO_ONE,
        deleted_at: null,
        members: {
          $size: 2,
        },
        'members.user': {
          $all: createConversationData.members,
        },
      });
      if (conversationExisted) {
        throw new BadRequestException('Conversation existed');
      }
    }

    // create conversation
    // init members
    const members = createConversationData.members.map((m): Member => {
      return {
        user: m,
        role:
          createConversationData.type === EConversationType.ONE_TO_ONE
            ? EMemberRole.MEMBER
            : authData._id === m
              ? EMemberRole.ADMIN
              : EMemberRole.MEMBER,
      };
    });
    // create
    const [conversation] = await this.conversationModel.create([
      {
        type: createConversationData.type,
        members: members,
      },
    ]);
    return conversation;
  }

  async lastConversations(
    authData: AuthData,
    query: ApiQueryDto,
  ): Promise<MultiItemsResponse<Conversation>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // get ids of my conversations
    const myConversationIds = (
      await this.conversationModel
        .find({
          members: {
            $elemMatch: {
              user: authData._id,
            },
          },
        })
        .distinct('_id')
    ).map((id) => id.toString());

    // get lastMessage
    const lastMessages = await this.lastMessageModel
      .find({
        conversation: { $in: myConversationIds },
      })
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'conversation',
        match: { deleted_at: null },
        populate: {
          path: 'members',
          match: { deleted_at: null },
          populate: {
            path: 'user',
            match: { deleted_at: null },
            select: 'name avatar customId',
          },
        },
      })
      .populate({
        path: 'message',
        match: { deleted_at: null },
      })
      .lean();

    // get total of lastMessage
    const total = await this.lastMessageModel.countDocuments({
      conversation: { $in: myConversationIds },
    });

    // from lastMessages to conversations
    const conversations = [];
    for (const lm of lastMessages) {
      if (!lm.conversation) continue;
      const conversation = lm.conversation as unknown as Conversation;
      conversation.lastMessage = lm.message as unknown as Message;
      conversations.push(conversation);
    }

    return {
      items: conversations,
      total: total,
    };
  }

  async findOne(
    conversationId: string,
    authData: AuthData,
  ): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findOne({
        deleted_at: null,
        _id: conversationId,
        members: {
          $elemMatch: {
            user: authData._id,
          },
        },
      })
      .populate('members.user')
      .lean();
    if (!conversation) throw new NotFoundException('Conversation not found');

    return conversation;
  }

  async update() {}

  async leave() {}
}
