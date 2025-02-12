import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('emails', {
  // TODO: update send email strategy
  limiter: {
    max: 1,
    duration: 1000,
  },
})
export class SendEmailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    await this.mailerService.sendMail(job.data);
  }
}
