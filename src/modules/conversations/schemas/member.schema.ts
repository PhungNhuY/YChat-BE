import { Prop, Schema } from '@nestjs/mongoose';

export enum EMemberRole {
  MEMBER = 1,
  ADMIN = 2,
}

@Schema({
  _id: false,
  versionKey: false,
})
export class Member {
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
