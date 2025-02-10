import { User } from '@modules/users/schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendRegistrationConfirmation(
    user: User,
    tokenId: string,
    tokenValue: string,
  ) {
    const protocol = this.configService.get<boolean>('WEB_HOST_TLS')
      ? 'https'
      : 'http';
    const webHost = this.configService.get<string>('WEB_HOST');

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email address',
      text: `Follow the link to verify your email: ${protocol}://${webHost}/auth/activate?uid=${user._id}&tid=${tokenId}&tv=${tokenValue}`,
    });
  }

  async sendResetPasswordRequest(
    user: User,
    tokenId: string,
    tokenValue: string,
  ) {
    const protocol = this.configService.get<boolean>('WEB_HOST_TLS')
      ? 'https'
      : 'http';
    const webHost = this.configService.get<string>('WEB_HOST');

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      text: `Follow the link to reset your password: ${protocol}://${webHost}/auth/reset-password?uid=${user._id}&tid=${tokenId}&tv=${tokenValue}`,
    });
  }
}
