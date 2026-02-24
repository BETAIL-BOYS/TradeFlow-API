import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
export declare class ThrottlerExceptionFilter implements ExceptionFilter {
    catch(exception: ThrottlerException, host: ArgumentsHost): void;
}
