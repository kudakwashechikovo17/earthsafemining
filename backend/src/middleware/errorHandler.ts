import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error:', err);

  // Check if it's an operational error (known error)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  // For mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation Error',
      details: err.message,
    });
    return;
  }

  // For mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({
      message: `Duplicate field value: ${field}. Please use another value.`,
    });
    return;
  }

  // For JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      message: 'Invalid token. Please log in again.',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      message: 'Your token has expired. Please log in again.',
    });
    return;
  }

  // For all other errors, return a generic server error
  res.status(500).json({
    message: 'Something went wrong',
  });
}; 