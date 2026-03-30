import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';

/**
 * Webhook Body Parser Middleware
 * 
 * Captures the raw request body for webhook endpoints before JSON parsing.
 * Stores the raw body on the request object for HMAC signature verification.
 * 
 * This middleware MUST run before the JSON body parser to intercept the raw stream.
 */
@Injectable()
export class WebhookBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only process POST requests to webhook endpoints
    if (req.method !== 'POST' || !req.path.includes('/webhook')) {
      return next();
    }

    // Accumulate the raw body chunks
    let rawBody = '';

    // Listen for data chunks
    req.on('data', (chunk: Buffer) => {
      rawBody += chunk.toString('utf8');
    });

    // When stream ends
    req.on('end', () => {
      // Store raw body on request object for use in guards/controllers
      (req as any).rawBody = rawBody;
      
      // Try to parse as JSON and attach to Express body parser
      try {
        req.body = JSON.parse(rawBody);
      } catch (error) {
        // If invalid JSON, set body to null
        req.body = null;
      }

      next();
    });

    // Handle stream errors
    req.on('error', (error) => {
      console.error('Error reading webhook body:', error);
      next(error);
    });
  }
}
