import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error message to the server console for debugging
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  // Return a 500 Internal Server Error status with standardized JSON response
  res.status(500).json({
    success: false,
    message: "Something went wrong"
  });
}
