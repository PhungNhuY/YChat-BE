import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '@modules/users/schemas/user.schema';
import { BaseSchemaSoftDelete } from '@common/base.schema';
import { ETokenType } from '@constants/token.constant';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
  collection: 'tokens',
})
export class Token extends BaseSchemaSoftDelete {
  @Prop({
    type: String,
    required: true,
    ref: User.name,
  })
  user: string | User;

  @Prop({
    type: String,
    required: true,
  })
  token: string;

  @Prop({
    type: Number,
    required: true,
  })
  expiresAt: number;

  @Prop({
    required: true,
    enum: ETokenType,
  })
  type: number;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

TokenSchema.index({
  user: 1,
  type: 1,
});
