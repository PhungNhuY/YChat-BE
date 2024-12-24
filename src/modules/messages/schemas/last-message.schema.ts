import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
  collection: 'lastMessages',
})
export class LastMessage {
  @Prop({
    required: true,
    type: String,
    ref: 'Conversation',
  })
  conversation: string;

  @Prop({
    required: true,
    type: String,
    ref: 'Message',
  })
  message: string;
}

export const LastMessageSchema = SchemaFactory.createForClass(LastMessage);
