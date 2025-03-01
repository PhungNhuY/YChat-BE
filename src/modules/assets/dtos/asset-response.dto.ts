import { Exclude, Expose } from 'class-transformer';

export class AssetResponseDto {
  @Expose()
  uploader: string;

  @Expose()
  fileName: string;

  @Expose()
  originalName: string;

  @Expose()
  mimeType: string;

  @Exclude()
  path: string;
}
