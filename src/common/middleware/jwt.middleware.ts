import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../auth/auth.service';

/**
 * requireJWT Middleware
 * Verifies the JSON Web Token in the Authorization: Bearer header
 */
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid format (Bearer token required)');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.authService.verifyJWT(token);
      
      // Attach user info to request if needed
      req['user'] = decoded;
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
