import { BaseSchemaSoftDelete } from '@common/base.schema';
import { MESSAGE_MAX_LENGTH } from '@constants/message.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum EFriendshipStatus {
  REQUESTED = 1,
  ACCEPTED = 2,
  DECLINED = 3,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'friendships',
})
export class Friendship extends BaseSchemaSoftDelete {
  @Prop({
    required: true,
    type: String,
    ref: 'User',
  })
  sender: string;

  @Prop({
    required: true,
    type: String,
    ref: 'User',
  })
  receiver: string;

  @Prop({
    required: true,
    type: Number,
    enum: EFriendshipStatus,
    default: EFriendshipStatus.REQUESTED,
  })
  status: EFriendshipStatus;

  @Prop({
    type: String,
    maxlength: MESSAGE_MAX_LENGTH,
  })
  message?: string;

  @Prop({
    type: Number, // unix time
  })
  acceptedAt?: number;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.index(
  { sender: 1, receiver: 1, deleted_at: 1 },
  { unique: true },
);
