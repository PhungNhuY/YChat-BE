import { User } from '@modules/users/schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegistrationConfirmation(user: User, verificationCode: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email address',
      text: `Follow the link to verify your email: http://locahost:3001/auth/verify?uid=${user._id}&code=${verificationCode}`,
    });
  }
}
