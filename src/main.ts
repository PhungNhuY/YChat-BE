import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { configSwagger } from '@configs/api-docs.config';
import helmet from 'helmet';
import { WebSocketAdapter } from '@modules/websocket/websocket.adapter';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // helmet
  app.use(helmet());

  // global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // // set global prefix
  // app.setGlobalPrefix('api');

  // cookie parser
  app.use(cookieParser());

  // enable CORS
  const corsOrigins: string[] = JSON.parse(
    (await configService.get('CORS_ALLOWED_LIST')) || '[]',
  );
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // swagger
  configSwagger(app);

  // ws adapter
  app.useWebSocketAdapter(new WebSocketAdapter(app, configService));

  // enable shutdown hook
  app.enableShutdownHooks();

  const server = await app.listen(await configService.get<number>('PORT'));

  // set server to app service
  const appService = app.get(AppService);
  appService.setServer(server);
}
bootstrap();
