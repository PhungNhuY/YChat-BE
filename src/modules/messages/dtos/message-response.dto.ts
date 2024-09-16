import { BaseResponseDto } from '@common/base-response.dto';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { User } from '@modules/users/schemas/user.schema';
import { Expose, Transform, Type } from 'class-transformer';
import { EMessageType } from '../schemas/message.schema';

export class MessageResponseDto extends BaseResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  user: User;

  @Expose()
  conversation: string;

  @Expose()
  type: EMessageType;

  @Expose()
  content: string;

  @Expose()
  @Transform((value) => value.obj?.created_at, { toClassOnly: true })
  createdAt: Date;
}
