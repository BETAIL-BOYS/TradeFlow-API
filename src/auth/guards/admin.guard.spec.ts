import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthService } from '../auth.service';

/**
 * Unit tests for the AdminGuard.
 * Verifies JWT validation and admin role enforcement.
 */
describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: { verifyJWT: jest.Mock };

  const createContext = (authHeader?: string): ExecutionContext => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: {},
    };
    if (authHeader) {
      request.headers.authorization = authHeader;
    }

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    authService = {
      verifyJWT: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  /**
   * Basic sanity check to ensure the guard is correctly instantiated.
   */
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  /**
   * Rejects requests without an Authorization header.
   */
  it('should throw UnauthorizedException when Authorization header is missing', () => {
    expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedException);
  });

  /**
   * Rejects wallet JWTs that lack the admin role.
   */
  it('should reject non-admin JWT payloads', () => {
    authService.verifyJWT.mockReturnValue({ publicKey: 'GABC123', sub: 'GABC123' });

    expect(() => guard.canActivate(createContext('Bearer wallet-token'))).toThrow(
      UnauthorizedException,
    );
  });

  /**
   * Accepts valid admin JWTs and attaches the payload to the request.
   */
  it('should allow admin JWT with role admin (Acceptance Criteria)', () => {
    const adminPayload = { role: 'admin', iat: 1234567890 };
    authService.verifyJWT.mockReturnValue(adminPayload);

    const context = createContext('Bearer admin-token');
    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest()['user']).toEqual(adminPayload);
  });
});
