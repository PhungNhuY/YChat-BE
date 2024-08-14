import { EUserGender } from '@constants/user.constant';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @MaxLength(64)
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsDateString()
  @IsOptional()
  DOB?: Date;

  @IsEnum(EUserGender)
  @IsOptional()
  gender?: EUserGender;
}
