import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum EConversationType {
  ONE_TO_ONE = 1,
  GROUP = 2,
}

export enum EConversationRole {
  MEMBER = 1,
  ADMIN = 2,
}

@Schema({
  _id: false,
})
export class Member {
  @Prop({
    type: String,
    required: true,
    ref: 'User',
  })
  user: string;

  @Prop({
    maxlength: 64,
    set: (nickname: string | null) => {
      if (typeof nickname === 'string') {
        return nickname.trim();
      }
      return nickname;
    },
  })
  nickname: string | null;

  @Prop({
    type: Number,
    enum: EConversationRole,
    default: EConversationRole.MEMBER,
  })
  conversationRole: EConversationRole;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Conversation extends BaseSchemaSoftDelete {
  @Prop({
    type: Number,
    enum: EConversationType,
    required: true,
  })
  type: EConversationType;

  @Prop({
    required: true,
    type: [Member],
    minlength: 2,
  })
  member: Member[];

  @Prop({
    type: String,
  })
  name?: string;

  @Prop({
    type: String,
  })
  color?: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
