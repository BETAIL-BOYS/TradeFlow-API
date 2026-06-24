import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Admin JWT Verification Guard.
 *
 * Protects administrative routes by requiring a valid Bearer JWT
 * with `role: 'admin'` in the payload (issued by POST /api/v1/admin/login).
 *
 * Requirements:
 * - Authorization header must be present and use Bearer scheme
 * - Token must be a valid, non-expired JWT signed with JWT_SECRET
 * - Token payload must include role === 'admin'
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  /**
   * Validates the incoming request by checking the admin JWT.
   *
   * @param context - The execution context of the request.
   * @returns true if the request is authorized.
   * @throws UnauthorizedException if the token is missing, invalid, or not an admin token.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.authService.verifyJWT(token);

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('Admin access required');
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
