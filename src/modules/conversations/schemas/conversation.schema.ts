import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Member } from './member.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum EConversationType {
  ONE_TO_ONE = 1,
  GROUP = 2,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
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
    type: Array<Member>,
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
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
