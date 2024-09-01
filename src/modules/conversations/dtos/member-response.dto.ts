import { Expose } from 'class-transformer';
import { EMemberRole } from '../schemas/member.schema';

export class MemberResponseDto {
  @Expose()
  user: string;

  @Expose()
  role: EMemberRole;

  @Expose()
  nickname?: string;

  @Expose()
  lastSeen?: number;
}
