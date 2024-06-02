import { Expose } from 'class-transformer';
import { EConversationType } from '../schemas/conversation.schema';
import { BaseResponseDto } from '@common/base-response.dto';

export class ConversationResponseDto extends BaseResponseDto {
  @Expose()
  type: EConversationType;

  @Expose()
  name: string;

  @Expose()
  color: string;

  @Expose()
  avatar: string;
}
