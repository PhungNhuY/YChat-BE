import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import { BaseSchemaSoftDelete } from '@common/base.schema';
import { EUserGender, EUserStatus } from '@constants/user.constant';
import { EMAIL_REGEX } from '@constants/regex.const';
import { standardizeString } from '@utils/string.util';
import { hash } from '@utils/hash.util';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  versionKey: false,
  collection: 'users',
})
export class User extends BaseSchemaSoftDelete {
  @Prop({
    maxlength: 64,
    set: (name: string) => {
      return standardizeString(name);
    },
    required: true,
  })
  name: string;

  @Prop({
    match: EMAIL_REGEX,
    required: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
  })
  customId?: string;

  @Prop()
  avatar?: string;

  @Prop()
  DOB?: Date;

  @Prop({
    type: Number,
    enum: EUserGender,
  })
  gender?: EUserGender;

  @Prop({
    required: true,
    type: Number,
    enum: EUserStatus,
    default: EUserStatus.INACTIVE,
  })
  status: EUserStatus;

  @Prop({
    required: true,
    select: false,
    type: Number,
  })
  validTokenIat: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// unique email
UserSchema.index({ email: 1, deleted_at: 1 }, { unique: true });

export const UserSchemaFactory = () => {
  const user_schema = UserSchema;

  // TODO check this middleware when updateOne...
  user_schema.pre('save', async function (next: NextFunction) {
    // hash password
    if (this.isModified('password')) {
      const hashedPassword = await hash(this.password);
      this.password = hashedPassword;
    }
    return next();
  });

  return user_schema;
};
