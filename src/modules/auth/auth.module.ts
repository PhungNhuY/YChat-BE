import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailsModule } from '@modules/emails/emails.module';

@Module({
  imports: [UsersModule, JwtModule.register({}), EmailsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
