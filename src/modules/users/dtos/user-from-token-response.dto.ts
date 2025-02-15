import { BaseResponseDto } from '@common/base-response.dto';
import { Expose } from 'class-transformer';

export class UserFromTokenResponseDto extends BaseResponseDto {
  @Expose()
  email: string;
}
