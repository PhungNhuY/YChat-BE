import { BadRequestException, Injectable } from '@nestjs/common';
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

  async findOne() {}

  async lastConversations(
    authData: AuthData,
    query: ApiQueryDto,
  ): Promise<MultiItemsResponse<Conversation>> {
    const conversations = await this.messageModel.aggregate([
      {
        $match: { deleted_at: null },
      },
      {
        // group by conversation and find max created_at with each conversation
        // push all messages to records
        $group: {
          _id: '$conversation',
          lastMessageAt: { $max: '$created_at' },
          records: { $push: '$$ROOT' },
        },
      },
      {
        // sort records desc by lastMessageAt
        $sort: { lastMessageAt: -1 },
      },
      {
        $project: {
          // filter records by lastMessageAt -> last message
          lastMessage: {
            $filter: {
              input: '$records',
              cond: {
                $eq: ['$$this.created_at', '$lastMessageAt'],
              },
              limit: 1,
            },
          },
          // convert id to ObjectId
          conversation: { $toObjectId: '$_id' },
        },
      },
      {
        // remove no more needed fields
        $project: { lastMessageAt: 0, _id: 0 },
      },
      {
        // lookup conversation
        $lookup: {
          from: 'conversations',
          localField: 'conversation',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      { $unwind: '$conversation' },
    ]);
    console.log(JSON.stringify(conversations, null, 4));
    return {
      items: conversations,
      total: conversations.length,
    };
  }

  async update() {}

  async leave() {}
}
