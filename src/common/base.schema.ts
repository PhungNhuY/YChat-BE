import { ObjectId } from 'mongoose';
import { Expose, Transform } from 'class-transformer';
import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  _id?: ObjectId | string;

  @Expose()
  @Transform((value) => value.obj?._id?.toString(), { toClassOnly: true })
  id: string;
}

export class BaseSchemaSoftDelete extends BaseSchema {
  @Prop({ default: null })
  deletedAt: Date;
}
