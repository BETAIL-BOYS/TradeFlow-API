import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response
      .status(HttpStatus.TOO_MANY_REQUESTS)
      .json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too Many Requests - Slow Down',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
