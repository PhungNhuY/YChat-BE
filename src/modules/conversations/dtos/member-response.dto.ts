import { Expose, Type } from 'class-transformer';
import { EMemberRole } from '../schemas/member.schema';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';

export class MemberResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  role: EMemberRole;

  @Expose()
  nickname?: string;

  @Expose()
  lastSeen?: number;
}
