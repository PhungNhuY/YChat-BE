import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { buildErrorResponse } from '@utils/api-response-builder';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // TODO: dev vs prod
    !(exception instanceof HttpException) && console.log(exception);

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
  }
}
