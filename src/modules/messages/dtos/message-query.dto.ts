import { ApiQueryDto } from '@common/api-query.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class MessageQueryDto extends ApiQueryDto {
  @IsOptional()
  @IsDateString()
  before?: string;
}
