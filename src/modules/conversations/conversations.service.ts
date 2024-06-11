import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dtos/create-conversation.dto';
import { Conversation, EConversationType } from './schemas/conversation.schema';
import { User } from '@modules/users/schemas/user.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { EMemberRole, Member } from '@modules/members/schemas/member.schema';
import { transaction } from '@common/transaction';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Member.name)
    private readonly memberModel: Model<Member>,
  ) {}

  async createConversation(
    createConversationData: CreateConversationDto,
    user: User,
  ): Promise<Conversation> {
    // user must be a conversation member
    if (!createConversationData.members.includes(user._id.toString())) {
      throw new BadRequestException('Members is invalid');
    }

    const conversation = await transaction<Conversation>(
      this.connection,
      async (session: ClientSession) => {
        // create conversation
        const [conversation] = await this.conversationModel.create(
          [{ type: createConversationData.type }],
          { session },
        );

        // create members
        const members = await this.memberModel.insertMany(
          createConversationData.members.map((m) => {
            return {
              conversation: conversation._id,
              role:
                conversation.type === EConversationType.GROUP &&
                user._id.toString() === m
                  ? EMemberRole.ADMIN
                  : EMemberRole.MEMBER,
              user: m,
              deleted_at: null,
            };
          }),
          { session },
        );

        // add members to conversation
        conversation.members = members.map((m) => m._id.toString());
        await conversation.save({
          validateBeforeSave: true,
          session,
        });

        conversation.members = members;
        return conversation;
      },
    );

    return conversation;
  }
}
