import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  collection: 'assets',
})
export class Asset extends BaseSchemaSoftDelete {
  @Prop({
    type: String,
    required: true,
    ref: 'User',
  })
  uploader: string;

  @Prop({
    type: String,
    required: true,
  })
  fileName: string;

  @Prop({
    type: String,
    required: true,
  })
  originalName: string;

  @Prop({
    type: String,
    required: true,
  })
  mimeType: string;

  @Prop({
    type: String,
    required: true,
    select: false,
  })
  path: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
