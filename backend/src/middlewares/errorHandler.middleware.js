/**
 * Global Error Handling Middleware
 * Centralized error handling for the entire application
 */

import { HTTP_STATUS, ERROR_MESSAGES } from '../config/app.constants.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * PostgreSQL Error Handler
 */
function handlePostgresError(error) {
  const pgErrorMap = {
    '23505': { status: HTTP_STATUS.CONFLICT, message: 'Dữ liệu đã tồn tại' },
    '23503': { status: HTTP_STATUS.BAD_REQUEST, message: 'Tham chiếu không hợp lệ' },
    '23502': { status: HTTP_STATUS.BAD_REQUEST, message: 'Thiếu trường bắt buộc' },
    '22P02': { status: HTTP_STATUS.BAD_REQUEST, message: 'Định dạng dữ liệu không hợp lệ' },
    '42P01': { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Bảng không tồn tại' },
    '42703': { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Cột không tồn tại' },
  };

  const pgError = pgErrorMap[error.code];
  if (pgError) {
    return new ApiError(pgError.status, pgError.message, {
      code: error.code,
      detail: error.detail,
      table: error.table,
      constraint: error.constraint,
    });
  }

  return new ApiError(
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGES.DATABASE_ERROR,
    { code: error.code, detail: error.detail }
  );
}

/**
 * Main Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // Convert to ApiError if it's a Postgres error
  if (err.code && err.severity) {
    error = handlePostgresError(err);
  }

  // Convert to ApiError if it's not already
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      err.message || ERROR_MESSAGES.INTERNAL_ERROR,
      null
    );
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_AI === 'true') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    });
  }

  // Send response
  const response = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
  };

  // Include details in development or debug mode
  if (
    (process.env.NODE_ENV === 'development' || process.env.DEBUG_AI === 'true') &&
    error.details
  ) {
    response.details = error.details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`,
    { method: req.method, path: req.originalUrl }
  );
  next(error);
}

/**
 * Async Handler Wrapper
 * Eliminates need for try-catch in async route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

