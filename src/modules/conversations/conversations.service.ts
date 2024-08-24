import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { Conversation, EConversationType } from './schemas/conversation.schema';
import { User } from '@modules/users/schemas/user.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { EMemberRole, Member } from '@modules/members/schemas/member.schema';
import { mongooseTransaction } from '@common/mongoose-transaction';
import { AuthData } from '@utils/types';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Member.name)
    private readonly memberModel: Model<Member>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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
          $all: createConversationData.members,
          $size: 2,
        },
      });
      if (conversationExisted) {
        throw new BadRequestException('Conversation existed');
      }
    }

    const conversation = await mongooseTransaction<Conversation>(
      this.connection,
      async (session: ClientSession) => {
        // create conversation
        const [conversation] = await this.conversationModel.create(
          [
            {
              type: createConversationData.type,
              members: createConversationData.members,
            },
          ],
          { session },
        );

        // create members
        const members = await this.memberModel.insertMany(
          createConversationData.members.map((m) => {
            return {
              conversation: conversation._id,
              role:
                conversation.type === EConversationType.GROUP &&
                authData._id === m
                  ? EMemberRole.ADMIN
                  : EMemberRole.MEMBER,
              user: m,
              deleted_at: null,
            };
          }),
          { session },
        );

        conversation.members = members;
        return conversation;
      },
    );

    return conversation;
  }

  async findAll() {}

  async findOne() {}

  async update() {}

  async leave() {}
}
