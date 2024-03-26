import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { BaseSchemaSoftDelete } from '@common/base.schema';
import { EUserGender, EUserStatus } from '@constants/user.constant';
import { EMAIL_REGEX } from '@constants/regex.const';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User extends BaseSchemaSoftDelete {
  @Prop({
    maxlength: 64,
    set: (first_name: string) => {
      return first_name.trim();
    },
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

  @Prop()
  avatar: string;

  @Prop()
  DOB: Date;

  @Prop({
    type: Number,
    enum: EUserGender,
  })
  gender: EUserGender;

  @Prop({
    required: true,
    type: Number,
    enum: EUserStatus,
    default: EUserStatus.INACTIVATE,
  })
  status: EUserStatus;

  @Prop({
    required: true,
    select: false,
    type: Number,
  })
  validTokenIat: number;

  @Prop({
    type: String,
    select: false,
  })
  verificationCode: string;

  @Prop({
    type: Number,
    select: false,
  })
  verificationCodeExpiresAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = () => {
  const user_schema = UserSchema;

  // TODO check this middleware when updateOne...
  user_schema.pre('save', async function (next: NextFunction) {
    // encode password
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(this.password, salt);
      this.password = hashPassword;
    }

    // encode verificationCode
    if (this.isModified('verificationCode') && !!this.verificationCode) {
      const salt = await bcrypt.genSalt(10);
      const hashVerificationCode = await bcrypt.hash(
        this.verificationCode,
        salt,
      );
      this.verificationCode = hashVerificationCode;
    }
    return next();
  });

  return user_schema;
};
