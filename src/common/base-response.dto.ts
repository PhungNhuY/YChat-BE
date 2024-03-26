import { Exclude, Expose, Type } from 'class-transformer';

export class BaseResponseDto {
  @Expose()
  @Type(() => String)
  _id: string;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  deleted_at: Date;
}
