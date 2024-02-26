import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { Expose } from 'class-transformer';

export class LoginResponseDto extends UserResponseDto {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
