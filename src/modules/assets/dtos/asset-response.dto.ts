import { BaseResponseDto } from '@common/base-response.dto';
import { Exclude, Expose } from 'class-transformer';

export class AssetResponseDto extends BaseResponseDto {
  @Expose()
  uploader: string;

  @Expose()
  fileName: string;

  @Expose()
  originalName: string;

  @Expose()
  mimeType: string;

  @Expose()
  size: number;

  @Exclude()
  path: string;
}
