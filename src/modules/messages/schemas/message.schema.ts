import { BaseSchemaSoftDelete } from '@common/base.schema';
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from '@constants/message.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum EMessageType {
  TEXT = 1,
  FIlE = 2,
  NOTIFICATION = 3,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'messages',
})
export class Message extends BaseSchemaSoftDelete {
  // from
  @Prop({
    type: String,
    ref: 'User',
  })
  user?: string;

  // to
  @Prop({
    required: true,
    type: String,
    ref: 'Conversation',
  })
  conversation: string;

  @Prop({
    type: Number,
    enum: EMessageType,
    required: true,
  })
  type: EMessageType;

  @Prop({
    required: true,
    type: String,
    maxlength: MESSAGE_MAX_LENGTH,
    minlength: MESSAGE_MIN_LENGTH,
  })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
