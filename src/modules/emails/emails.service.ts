import { User } from '@modules/users/schemas/user.schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { SendEmailDto } from './dtos/send-email.dto';

const SEND_EMAIL = 'sendEmail';

@Injectable()
export class EmailsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('emails')
    private readonly emailsQueue: Queue,
  ) {}

  async sendEmails(emails: Array<SendEmailDto>) {
    const tasks = [];
    emails.forEach((email) => {
      const task = this.emailsQueue.add(SEND_EMAIL, email);
      tasks.push(task);
    });

    // add task to queue
    await Promise.all(tasks);
  }

  async sendRegistrationConfirmation(
    user: User,
    tokenId: string,
    tokenValue: string,
  ) {
    const protocol = this.configService.get<boolean>('WEB_HOST_TLS')
      ? 'https'
      : 'http';
    const webHost = this.configService.get<string>('WEB_HOST');

    await this.sendEmails([
      {
        to: user.email,
        subject: 'Verify your email address',
        text: `Follow the link to verify your email: ${protocol}://${webHost}/auth/activate?uid=${user._id}&tid=${tokenId}&tv=${tokenValue}`,
      },
    ]);
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

    await this.sendEmails([
      {
        to: user.email,
        subject: 'Reset your password',
        text: `Follow the link to reset your password: ${protocol}://${webHost}/auth/reset-password?uid=${user._id}&tid=${tokenId}&tv=${tokenValue}`,
      },
    ]);
  }
}
