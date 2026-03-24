# Error Handling Implementation

This document describes the standard error handling middleware implemented for the TradeFlow-API project.

## Overview

The application now includes comprehensive error handling that ensures:
- All unexpected errors are caught and handled gracefully
- API always responds with JSON format, even during errors
- Errors are logged for debugging purposes
- Consistent error response format across the application

## Implementation Details

### 1. Global Exception Filter (`AllExceptionsFilter`)

**Location**: `src/common/filters/all-exceptions.filter.ts`

This NestJS exception filter catches all unhandled exceptions and formats them consistently:

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Catches all exceptions and returns standardized JSON responses
  // Logs errors for debugging
  // Returns { success: false, message: "Something went wrong" } for 500 errors
}
```

### 2. Express Error Handler Middleware

**Location**: `src/common/middleware/errorHandler.ts`

Traditional Express-style error handler that can be used with Express middleware:

```typescript
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Logs error to console
  // Returns 500 status with { success: false, message: "Something went wrong" }
}
```

### 3. Integration

The global exception filter is registered in `src/app.module.ts` using the `APP_FILTER` token, ensuring it catches all errors throughout the application.

## Features

- **Automatic Error Logging**: All errors are logged with timestamps and stack traces
- **Consistent JSON Responses**: All errors return JSON with `success: false` format
- **Security**: Internal error details are not exposed to clients
- **HTTP Status Codes**: Appropriate status codes are maintained (500 for internal errors)
- **Request Context**: Error responses include the request path for debugging

## Testing

A test endpoint has been added to verify error handling:

```
GET /invoices/test-error
```

This endpoint deliberately throws an error to demonstrate the global error handling in action.

## Error Response Format

All error responses follow this consistent format:

```json
{
  "success": false,
  "message": "Something went wrong",
  "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ",
  "path": "/invoices/test-error"
}
```

## Benefits

1. **Prevents Server Crashes**: Unhandled exceptions no longer crash the server
2. **Better User Experience**: Clients receive structured error responses
3. **Improved Debugging**: Errors are logged with full context
4. **Security**: Internal error details are not exposed
5. **Consistency**: All endpoints handle errors uniformly

## Usage

The error handling is automatically active once the application starts. No additional configuration is required.

For custom error handling in specific controllers, you can still throw `HttpException` with specific status codes and messages, which will be properly formatted by the global filter.
