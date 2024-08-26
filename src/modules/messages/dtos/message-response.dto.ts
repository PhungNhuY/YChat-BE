import { BaseResponseDto } from '@common/base-response.dto';
import { EConversationType } from '@modules/conversations/schemas/conversation.schema';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { User } from '@modules/users/schemas/user.schema';
import { Expose, Transform, Type } from 'class-transformer';

export class MessageResponseDto extends BaseResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  user: User;

  @Expose()
  conversation: string;

  @Expose()
  type: EConversationType;

  @Expose()
  content: string;

  @Expose()
  @Transform((value) => value.obj?.created_at, { toClassOnly: true })
  createdAt: Date;
}
