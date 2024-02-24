import { ObjectId } from 'mongoose';
import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  _id?: ObjectId | string;
}

export class BaseSchemaSoftDelete extends BaseSchema {
  @Prop({ default: null })
  deletedAt: Date;
}
