import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginResponseDto extends OmitType(UserResponseDto, ['email']) {
  @Expose()
  email: string;

  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
