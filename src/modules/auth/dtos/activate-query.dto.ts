import { IsMongoId, IsString } from 'class-validator';

export class ActivateQueryDto {
  @IsMongoId()
  @IsString()
  uid: string;

  @IsString()
  code: string;
}
