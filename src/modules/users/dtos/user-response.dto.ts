import { BaseResponseDto } from '@common/base-response.dto';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto extends BaseResponseDto {
  @Expose()
  name: string;

  @Expose()
  DOB: Date;

  @Expose()
  gender: number;

  @Expose()
  avatar: string;

  @Expose()
  status: number;

  @Exclude()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  validTokenIat: number;
}
