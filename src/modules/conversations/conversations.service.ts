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
    const lastMessage = await this.lastMessageModel
      .find({
        conversation: { $in: myConversationIds },
      })
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'conversation',
        match: { deleted_at: null },
      })
      .populate({
        path: 'message',
        match: { deleted_at: null },
      })
      .lean();

    const conversations = [];
    for (const lm of lastMessage) {
      if (!lm.conversation) continue;
      const conversation = lm.conversation as unknown as Conversation;
      conversation.lastMessage = lm.message as unknown as Message;
      conversations.push(conversation);
    }

    return {
      items: [],
      total: 0,
    };

    // get conversations by last message
    // let conversations = await this.messageModel.aggregate([
    //   {
    //     $match: {
    //       deleted_at: null,
    //       conversation: { $in: myConversationIds },
    //     },
    //   },
    //   // group by conversation and find max created_at with each conversation
    //   // push all messages to records
    //   {
    //     $group: {
    //       _id: '$conversation',
    //       lastMessageAt: { $max: '$created_at' },
    //       records: { $push: '$$ROOT' },
    //     },
    //   },
    //   // sort records desc by lastMessageAt
    //   {
    //     $sort: { lastMessageAt: -1 },
    //   },
    //   {
    //     $project: {
    //       // filter records by lastMessageAt -> last message
    //       lastMessage: {
    //         $filter: {
    //           input: '$records',
    //           cond: {
    //             $eq: ['$$this.created_at', '$lastMessageAt'],
    //           },
    //           limit: 1,
    //         },
    //       },
    //       // convert id to ObjectId
    //       conversation: { $toObjectId: '$_id' },
    //     },
    //   },
    //   // change last message from array to object
    //   {
    //     $addFields: {
    //       lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
    //     },
    //   },
    //   // pagination
    //   { $skip: skip },
    //   { $limit: limit },
    //   // lookup conversation
    //   {
    //     $lookup: {
    //       from: 'conversations',
    //       localField: 'conversation',
    //       foreignField: '_id',
    //       as: 'conversation',
    //     },
    //   },
    //   { $unwind: '$conversation' },
    //   // lookup last message user
    //   {
    //     $set: {
    //       'lastMessage.user': { $toObjectId: '$lastMessage.user' },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'lastMessage.user',
    //       foreignField: '_id',
    //       as: 'lastMessage.user',
    //     },
    //   },
    //   { $unwind: '$lastMessage.user' },

    //   // ---------- LOOKUP AN ARRAY OF OBJECTS --------- start
    //   // lookup members
    //   {
    //     // convert string id to ObjectId
    //     $addFields: {
    //       'conversation.members': {
    //         $map: {
    //           input: '$conversation.members',
    //           in: {
    //             user: {
    //               $convert: {
    //                 input: '$$this.user',
    //                 to: 'objectId',
    //                 onError: null,
    //               },
    //             },
    //             role: '$$this.role',
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     // conversation.members is an array of object
    //     // we need to unwind it to lookup each member
    //     $unwind: {
    //       path: '$conversation.members',
    //     },
    //   },
    //   {
    //     // lookup user
    //     $lookup: {
    //       from: 'users',
    //       localField: 'conversation.members.user',
    //       foreignField: '_id',
    //       as: 'conversation.members.user',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$conversation.members.user',
    //     },
    //   },
    //   {
    //     // after lookup, group by conversation id
    //     $group: {
    //       _id: '$_id',
    //       conversation: { $first: '$conversation' },
    //       lastMessage: { $first: '$lastMessage' },
    //       members: {
    //         $push: {
    //           user: '$conversation.members.user',
    //           role: '$conversation.members.role',
    //         },
    //       },
    //     },
    //   },
    //   {
    //     // move lookuped members back to conversation
    //     $addFields: {
    //       'conversation.members': '$members',
    //       'conversation.lastMessage': '$lastMessage', // By the way, we move lastMessage into conversation
    //     },
    //   },
    //   {
    //     // unwind conversation.members to lookup each member and group them back
    //     // we lost the order -> resort them
    //     $sort: { 'conversation.lastMessage.created_at': -1 },
    //   },
    //   // ---------- LOOKUP AN ARRAY OF OBJECTS --------- end
    //   // remove no more needed fields
    //   {
    //     $project: {
    //       lastMessage: 0,
    //       _id: 0,
    //       members: 0,
    //     },
    //   },
    // ]);
    // conversations = conversations.map((c) => c.conversation);

    // return {
    //   items: conversations,
    //   total: myConversationIds.length,
    // };
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
