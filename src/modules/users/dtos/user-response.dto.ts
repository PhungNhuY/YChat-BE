import { BaseResponseDto } from '@common/base-response.dto';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto extends BaseResponseDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  DOB: Date;

  @Expose()
  gender: number;

  @Expose()
  avatar: string;

  @Expose()
  status: number;

  @Exclude()
  password: string;

  @Exclude()
  verificationCode: string;

  @Exclude()
  verificationCodeExpiresAt: number;

  @Exclude()
  validTokenIat: number;
}
