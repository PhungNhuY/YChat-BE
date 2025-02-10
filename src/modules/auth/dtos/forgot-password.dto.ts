import { IsEmail } from 'class-validator';

export class FogotPasswordDto {
  @IsEmail()
  email: string;
}
