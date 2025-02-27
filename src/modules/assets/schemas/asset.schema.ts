import { BaseSchemaSoftDelete } from '@common/base.schema';
import { Prop, SchemaFactory } from '@nestjs/mongoose';

export class Asset extends BaseSchemaSoftDelete {
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
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
