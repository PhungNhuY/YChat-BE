import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  uid: string;

  @IsString()
  tid: string;

  @IsString()
  tv: string;

  @IsString()
  @MinLength(8)
  password: string;
}
