import { IsString, MinLength } from 'class-validator';
import { TokenDto } from './token.dto';

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @MinLength(8)
  password: string;
}
