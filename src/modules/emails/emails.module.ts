import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  ],
  providers: [EmailsService],
})
export class EmailsModule {}
