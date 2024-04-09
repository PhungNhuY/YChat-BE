import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum EMessageType {
  TEXT = 1,
  FIlE = 2,
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Message extends BaseSchemaSoftDelete {
  @Prop({
    type: Number,
    enum: EMessageType,
    required: true,
  })
  type: EMessageType;

  @Prop({
    required: true,
    type: String,
  })
  content: string;

  // to
  @Prop({
    required: true,
    type: String,
    ref: 'Conversation',
  })
  conversation: string;

  // from
  @Prop({
    required: true,
    type: String,
    ref: 'User',
  })
  user: string;

  @Prop({
    required: true,
    type: Number,
  })
  sent_at: number; // unix time
}

export const MessageSchema = SchemaFactory.createForClass(Message);
