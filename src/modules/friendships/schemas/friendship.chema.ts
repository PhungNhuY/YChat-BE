import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Prop, Schema } from '@nestjs/mongoose';

export enum EFriendshipStatus {
  REQUESTED = 1,
  ACCEPTED = 2,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
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
    type: Number, // unix time
  })
  accepted_at?: number;
}
