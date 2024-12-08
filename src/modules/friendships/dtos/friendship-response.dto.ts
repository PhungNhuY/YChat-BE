import { BaseResponseDto } from '@common/base-response.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { EFriendshipStatus } from '../schemas/friendship.schema';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';

export class FriendshipResponseDto extends BaseResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  sender: string;

  @Expose()
  @Type(() => UserResponseDto)
  receiver: string;

  @Expose()
  status: EFriendshipStatus;

  @Expose()
  message?: string;

  @Expose()
  acceptedAt?: number;

  @Expose()
  @Transform((value) => value.obj?.created_at, { toClassOnly: true })
  createdAt: Date;
}
