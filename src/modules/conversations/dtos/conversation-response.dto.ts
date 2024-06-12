import { Expose, Type } from 'class-transformer';
import { EConversationType } from '../schemas/conversation.schema';
import { BaseResponseDto } from '@common/base-response.dto';
import { MemberResponseDto } from '@modules/members/dtos/member-response.dto';

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
}
