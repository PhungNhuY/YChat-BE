import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '@modules/users/users.service';
import { User } from '@modules/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  async register(registerData: RegisterDto): Promise<User> {
    const newUser = await this.userService.create(registerData);
    return newUser;
  }
}
