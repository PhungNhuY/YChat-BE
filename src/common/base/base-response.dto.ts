import { Exclude, Expose, Type } from 'class-transformer';

export class BaseResponseDto {
  @Expose()
  @Type(() => String)
  _id: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Exclude()
  deleted_at: Date;
}
