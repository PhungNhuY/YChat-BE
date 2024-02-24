import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import { BaseSchemaSoftDelete } from '@common/base.schema';
import { EUserGender, EUserStatus } from '@constants/user.constant';

@Schema({
  timestamps: true,
})
export class User extends BaseSchemaSoftDelete {
  @Prop({
    maxlength: 64,
    set: (first_name: string | null) => {
      if (typeof first_name === 'string') {
        return first_name.trim();
      }
      return first_name;
    },
  })
  firstName: string | null;

  @Prop({
    maxlength: 64,
    set: (lastName: string | null) => {
      if (typeof lastName === 'string') {
        return lastName.trim();
      }
      return lastName;
    },
  })
  lastName: string;

  @Prop({
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
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
    return next();
  });

  return user_schema;
};
