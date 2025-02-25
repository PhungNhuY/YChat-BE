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
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis, { Keyv } from '@keyv/redis';
import { AssetsModule } from './modules/assets/assets.module';

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
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_CONNECTION_STRING'),
        dbName: configService.get<string>('MONGODB_DBNAME'),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const REDIS_HOST = configService.get<string>('REDIS_HOST');
        const REDIS_PORT = configService.get<number>('REDIS_PORT');
        const REDIS_PASSWORD = configService.get<string>('REDIS_PASSWORD');
        const url = `redis://${REDIS_HOST}:${REDIS_PORT}`;
        return {
          stores: [
            new Keyv(
              new KeyvRedis({
                url,
                password: REDIS_PASSWORD,
                socket: {
                  host: REDIS_HOST,
                  port: REDIS_PORT,
                },
              }),
              {
                namespace: 'ychat',
                ttl: 5 * 60 * 1000,
              },
            ),
          ],
        };
      },
    }),

    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    EmailsModule,
    ConversationsModule,
    MessagesModule,
    WebsocketModule,
    FriendshipsModule,
    AssetsModule,
    ...(process.env.NODE_ENV === 'development' ? [DevModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
