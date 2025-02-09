import { IsMongoId, IsString } from 'class-validator';

export class ActivateAccountQueryDto {
  @IsMongoId()
  @IsString()
  uid: string;

  @IsString()
  tid: string;

  @IsString()
  tv: string;
}
