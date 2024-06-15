import { IsEnum, IsMongoId, IsString, MaxLength } from 'class-validator';
import { EMessageType } from '../schemas/message.schema';
import { Transform } from 'class-transformer';
import { standardizeString } from '@utils/string.util';

export class CreateMessageDto {
  @IsMongoId()
  user: string;

  @IsMongoId()
  conversation: string;

  @IsEnum(EMessageType)
  type: EMessageType;

  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => {
    return standardizeString(value);
  })
  content: string;
}
