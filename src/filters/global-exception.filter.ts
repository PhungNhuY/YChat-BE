import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { buildErrorResponse } from '@utils/api-response-builder.util';
import { Response } from 'express';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class GlobalExceptionFilter
  extends BaseWsExceptionFilter
  implements ExceptionFilter
{
  catch(exception: any, host: ArgumentsHost) {
    // TODO: dev vs prod
    if (
      !(exception instanceof HttpException || exception instanceof WsException)
    ) {
      console.log(exception);
    }

    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      const isHttpException = exception instanceof HttpException;

      const status = isHttpException ? exception.getStatus() : 500;
      const message = isHttpException
        ? (exception.getResponse() as unknown as any).error
        : 'Internal server error';
      const error = isHttpException
        ? (exception.getResponse() as unknown as any).message
        : null;

      response.status(status).json(buildErrorResponse(message, error));
    } else if (host.getType() === 'ws') {
      console.log('ws error');
    }
  }
}
