import { MESSAGE_MAX_LENGTH } from '@constants/message.constant';
import { standardizeString } from '@utils/string.util';
import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @IsMongoId()
  receiver: string;

  @IsOptional()
  @IsString()
  @MaxLength(MESSAGE_MAX_LENGTH)
  @Transform(({ value }) => {
    return standardizeString(value);
  })
  messages?: string;
}
