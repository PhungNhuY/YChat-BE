import { ETokenType } from '@constants/token.constant';
import { Transform } from 'class-transformer';
import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

const message = 'Invalid verification code';

export class TokenDto {
  @IsString()
  @IsMongoId({ message })
  uid: string;

  @IsString()
  @IsMongoId({ message })
  tid: string;

  @IsString()
  @IsNotEmpty({ message })
  tv: string;
}

export class GetUserFromTokenDto extends TokenDto {
  @IsEnum(ETokenType)
  @Transform(({ value }) => parseInt(value))
  tokenType: ETokenType;
}
