import { Expose, Type } from 'class-transformer';
import { EConversationType } from '../schemas/conversation.schema';
import { BaseResponseDto } from '@common/base-response.dto';
import { MessageResponseDto } from '@modules/messages/dtos/message-response.dto';
import { MemberResponseDto } from './member-response.dto';

export class ConversationResponseDto extends BaseResponseDto {
  @Expose()
  type: EConversationType;

  @Expose()
  name: string;

  @Expose()
  @Type(() => MemberResponseDto)
  members: MemberResponseDto[];

  @Expose()
  color: string;

  @Expose()
  avatar: string;

  @Expose()
  @Type(() => MessageResponseDto)
  lastMessage?: MessageResponseDto;
}
