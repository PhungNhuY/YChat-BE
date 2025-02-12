import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { SendEmailProcessor } from './send-email.processor';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_POST'),
          auth: {
            user: configService.get<number>('SMTP_USER'),
            pass: configService.get<number>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `YChat <${configService.get<number>('SMTP_USER')}>`,
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'emails',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // ms
        },
      },
    }),
  ],
  providers: [EmailsService, SendEmailProcessor],
  exports: [EmailsService],
})
export class EmailsModule {}
