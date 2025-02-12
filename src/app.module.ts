import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import validationSchema from './configs/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { EmailsModule } from './modules/emails/emails.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { DevModule } from './modules/dev/dev.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
      isGlobal: true,
      validationSchema: validationSchema,
      cache: true,
      expandVariables: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_CONNECTION_STRING'),
        dbName: configService.get<string>('MONGODB_DBNAME'),
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    EmailsModule,
    ConversationsModule,
    MessagesModule,
    WebsocketModule,
    FriendshipsModule,
    ...(process.env.NODE_ENV === 'development' ? [DevModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
