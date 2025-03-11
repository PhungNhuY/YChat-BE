import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { EFriendshipStatus, Friendship } from './schemas/friendship.schema';
import { ClientSession, Connection, FilterQuery, Model } from 'mongoose';
import { AuthData } from '@utils/types';
import { CreateRequestDto } from './dtos/create-request.dto';
import { User } from '@modules/users/schemas/user.schema';
import { ApiQueryDto } from '@common/api-query.dto';
import { MultiItemsResponse } from '@utils/api-response-builder.util';
import { mongooseTransaction } from '@common/mongoose-transaction';
import {
  Conversation,
  EConversationType,
} from '@modules/conversations/schemas/conversation.schema';
import { EMemberRole } from '@modules/conversations/schemas/member.schema';
import { MessagesService } from '@modules/messages/messages.service';
import { ESystemNotificationMessage } from '@constants/message.constant';

@Injectable()
export class FriendshipsService {
  constructor(
    @InjectModel(Friendship.name)
    private readonly friendshipModel: Model<Friendship>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly messageService: MessagesService,
  ) {}

  async getFriends(
    authData: AuthData,
    query: ApiQueryDto,
  ): Promise<MultiItemsResponse<Friendship>> {
    // build filter query
    const filter: FilterQuery<Friendship> = {
      deleted_at: null,
      status: EFriendshipStatus.ACCEPTED,
      $or: [{ sender: authData._id }, { receiver: authData._id }],
    };

    // build get friendship query
    const itemsQuery = this.friendshipModel.find(filter);
    query?.page && itemsQuery.skip((query.page - 1) * query.limit);
    query?.limit && itemsQuery.limit(query.limit);
    itemsQuery
      .populate({
        path: 'sender',
        match: { deleted_at: null },
        select: 'name avatar customId',
      })
      .populate({
        path: 'receiver',
        match: { deleted_at: null },
        select: 'name avatar customId',
      });
    itemsQuery.lean();

    // build get total of friendship query
    const totalQuery = this.friendshipModel.countDocuments(filter);

    const [items, total] = await Promise.all([itemsQuery, totalQuery]);

    return { items, total };
  }

  async getSendRequests(
    authData: AuthData,
    query: ApiQueryDto,
  ): Promise<MultiItemsResponse<Friendship>> {
    // build filter query
    const filter: FilterQuery<Friendship> = {
      deleted_at: null,
      status: EFriendshipStatus.REQUESTED,
      sender: authData._id,
    };

    // build get send-requests query
    const itemsQuery = this.friendshipModel.find(filter);
    query?.page && itemsQuery.skip((query.page - 1) * query.limit);
    query?.limit && itemsQuery.limit(query.limit);
    itemsQuery.populate({
      path: 'receiver',
      match: { deleted_at: null },
      select: 'name avatar customId',
    });
    itemsQuery.lean();

    // build get total of send-requests query
    const totalQuery = this.friendshipModel.countDocuments(filter);

    const [items, total] = await Promise.all([itemsQuery, totalQuery]);

    return { items, total };
  }

  async getReceivedRequests(
    authData: AuthData,
    query: ApiQueryDto,
  ): Promise<MultiItemsResponse<Friendship>> {
    // build filter query
    const filter: FilterQuery<Friendship> = {
      deleted_at: null,
      status: EFriendshipStatus.REQUESTED,
      receiver: authData._id,
    };

    // build get received-requests query
    const itemsQuery = this.friendshipModel.find(filter);
    itemsQuery.sort({ _id: -1 });
    query?.page && itemsQuery.skip((query.page - 1) * query.limit);
    query?.limit && itemsQuery.limit(query.limit);
    itemsQuery.populate({
      path: 'sender',
      match: { deleted_at: null },
      select: 'name avatar customId',
    });
    itemsQuery.lean();

    // build get total of received-requests query
    const totalQuery = this.friendshipModel.countDocuments(filter);

    const [items, total] = await Promise.all([itemsQuery, totalQuery]);

    return { items, total };
  }

  async createRequest(authData: AuthData, createRequestData: CreateRequestDto) {
    // validate receiver
    const validReceiver = await this.userModel.exists({
      _id: createRequestData.receiver,
      deleted_at: null,
    });
    if (!validReceiver) throw new BadRequestException('Receiver not found');

    // check friendship status
    const validFriendship = await this.friendshipModel.exists({
      deleted_at: null,
      $or: [
        { sender: authData._id, receiver: createRequestData.receiver },
        { sender: createRequestData.receiver, receiver: authData._id },
      ],
      status: { $ne: EFriendshipStatus.DECLINED },
    });
    if (validFriendship)
      throw new BadRequestException('Request has been duplicated');

    await this.friendshipModel.create({
      sender: authData._id,
      receiver: createRequestData.receiver,
      messages: createRequestData.messages,
    });
  }

  async changeRequestStatus(
    authData: AuthData,
    friendshipId: string,
    status: EFriendshipStatus,
  ) {
    // find requested friendship
    const friendship = await this.friendshipModel.findOne({
      deleted_at: null,
      _id: friendshipId,
      receiver: authData._id,
      status: EFriendshipStatus.REQUESTED,
    });
    if (!friendship) throw new BadRequestException('Friendship not found');

    await mongooseTransaction(
      this.connection,
      async (session: ClientSession) => {
        // ------ START TRANSACTION
        // change status
        friendship.status = status;
        await friendship.save({ session });

        // create and send notification after request is accepted
        if (status === EFriendshipStatus.ACCEPTED) {
          // check conversation exists
          let conversation = await this.conversationModel.exists({
            deleted_at: null,
            type: EConversationType.ONE_TO_ONE,
            members: {
              $size: 2,
            },
            'members.user': {
              $all: [friendship.sender, friendship.receiver],
            },
          });

          // create conversation if not exists
          if (!conversation) {
            [conversation] = await this.conversationModel.create(
              [
                {
                  type: EConversationType.ONE_TO_ONE,
                  members: [
                    { user: friendship.sender, role: EMemberRole.MEMBER },
                    { user: friendship.receiver, role: EMemberRole.MEMBER },
                  ],
                },
              ],
              {
                session,
              },
            );
          }

          // send notification to conversation
          await this.messageService.createNotificationMessage(
            conversation._id.toString(),
            ESystemNotificationMessage.BE_FRIEND,
            session,
          );
        }
        // ------ END TRANSACTION
      },
    );
  }
}
