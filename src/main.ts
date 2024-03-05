import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@filters/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // set global prefix
  app.setGlobalPrefix('api');

  // cookie parser
  app.use(cookieParser());

  await app.listen(process.env.PORT);
}
bootstrap();
