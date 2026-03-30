import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

/**
 * HMAC Signature Verification Guard
 * 
 * Verifies cryptographic HMAC signatures in webhook headers to prevent spoofing.
 * Uses constant-time comparison to mitigate timing attacks.
 * 
 * Requirements:
 * - X-Signature header must be present in the request
 * - WEBHOOK_SECRET environment variable must be set
 * - Signature must match the HMAC-SHA256 hash of the raw request body
 * - WebhookBodyMiddleware must be applied to capture raw body
 */
@Injectable()
export class HmacSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Verify WEBHOOK_SECRET is configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new UnauthorizedException('Webhook signature verification is not configured');
    }

    // Extract the X-Signature header
    const providedSignature = request.get('x-signature');
    if (!providedSignature) {
      throw new BadRequestException('Missing X-Signature header');
    }

    // Get raw request body (captured by WebhookBodyMiddleware)
    const rawBody = (request as any).rawBody;
    if (!rawBody) {
      throw new BadRequestException('Request body is empty');
    }

    // Generate HMAC-SHA256 hash of the raw body
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    // Verifies both signature length and content match
    if (!this.constantTimeCompare(computedSignature, providedSignature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }

  /**
   * Constant-time string comparison
   * 
   * Compares two strings in constant time to prevent timing attacks
   * that could reveal information about the correct signature.
   * 
   * @param a - First string to compare
   * @param b - Second string to compare
   * @returns true if strings are equal, false otherwise
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
