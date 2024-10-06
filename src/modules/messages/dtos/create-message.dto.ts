import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { EMessageType } from '../schemas/message.schema';
import { Transform } from 'class-transformer';
import { standardizeString } from '@utils/string.util';
import {
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
} from '@constants/message.constant';

export class CreateMessageDto {
  @IsEnum(EMessageType)
  type: EMessageType;

  @IsString()
  @MaxLength(MESSAGE_MAX_LENGTH)
  @MinLength(MESSAGE_MIN_LENGTH)
  @Transform(({ value }) => {
    return standardizeString(value);
  })
  content: string;
}
