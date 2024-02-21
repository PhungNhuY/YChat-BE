import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EGender } from 'src/modules/users/schemas/user.schema';

export class RegisterDto {
  @MaxLength(64)
  @IsNotEmpty()
  firstName: string;

  @MaxLength(64)
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsDateString()
  @IsOptional()
  DOB: Date;

  @IsEnum(EGender)
  @IsOptional()
  gender: EGender;
}
