import { BaseResponseDto } from '@common/base-response.dto';
import { AssetResponseDto } from '@modules/assets/dtos/asset-response.dto';
import { FriendshipResponseDto } from '@modules/friendships/dtos/friendship-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';

export class UserResponseDto extends BaseResponseDto {
  @Expose()
  name: string;

  @Expose()
  DOB: Date;

  @Expose()
  gender: number;

  @Expose()
  @Type(() => AssetResponseDto)
  avatar: string | AssetResponseDto;

  @Expose()
  status: number;

  @Exclude()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  validTokenIat: number;
}

export class UserWithFriendshipResponseDto extends UserResponseDto {
  @Expose()
  @Type(() => FriendshipResponseDto)
  friendship?: FriendshipResponseDto;
}
