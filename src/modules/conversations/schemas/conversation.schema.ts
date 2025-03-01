import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Member } from './member.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Message } from '@modules/messages/schemas/message.schema';

export enum EConversationType {
  ONE_TO_ONE = 1,
  GROUP = 2,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'conversations',
})
export class Conversation extends BaseSchemaSoftDelete {
  @Prop({
    type: Number,
    enum: EConversationType,
    required: true,
  })
  type: EConversationType;

  @Prop({
    type: String,
    minlength: 1,
    maxlength: 64,
    set: (name: string) => {
      return name.trim();
    },
  })
  name?: string;

  @Prop({
    type: [Member],
    default: [],
  })
  members: Array<Member>;

  @Prop({
    type: String,
  })
  color?: string;

  @Prop({
    type: String,
  })
  avatar?: string;

  lastMessage?: Message;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
