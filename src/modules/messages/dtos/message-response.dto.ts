import { BaseResponseDto } from '@common/base-response.dto';
import { EConversationType } from '@modules/conversations/schemas/conversation.schema';
import { Expose, Transform } from 'class-transformer';

export class MessageResponseDto extends BaseResponseDto {
  @Expose()
  user: string;

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
