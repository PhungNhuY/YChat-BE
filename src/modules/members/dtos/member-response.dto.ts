import { BaseResponseDto } from '@common/base-response.dto';
import { Expose } from 'class-transformer';
import { EMemberRole } from '../schemas/member.schema';

export class MemberResponseDto extends BaseResponseDto {
  @Expose()
  conversation: string;

  @Expose()
  user: string;

  @Expose()
  role: EMemberRole;

  @Expose()
  nickname?: string;

  @Expose()
  lastSeen?: number;
}
