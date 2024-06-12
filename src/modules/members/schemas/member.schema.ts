import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum EMemberRole {
  MEMBER = 1,
  ADMIN = 2,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
  collection: 'members',
  _id: false,
})
export class Member extends BaseSchemaSoftDelete {
  @Prop({
    required: true,
    type: String,
    ref: 'Conversation',
  })
  conversation: string;

  @Prop({
    required: true,
    type: String,
    ref: 'User',
  })
  user: string;

  @Prop({
    required: true,
    type: Number,
    enum: EMemberRole,
  })
  role: EMemberRole;

  @Prop({
    type: String,
    minlength: 1,
    maxlength: 64,
    set: (nickname: string) => {
      return nickname.trim();
    },
  })
  nickname?: string;

  @Prop({
    type: Number, // unix time
  })
  lastSeen?: number;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index({ user: 1, conversation: 1 }, { unique: true });
