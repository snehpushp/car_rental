export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiValidationError extends ApiError {
  validation_errors?: ValidationError[];
}

// Standard HTTP status codes we'll use
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common error messages
export const ErrorMessages = {
  UNAUTHORIZED: 'You must be logged in to access this resource',
  FORBIDDEN: 'You do not have permission to access this resource',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'Database operation failed',
  BOOKING_CONFLICT: 'Car is not available for the selected dates',
  INVALID_DATE_RANGE: 'Invalid date range provided',
  BOOKING_NOT_CANCELABLE: 'This booking cannot be cancelled',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this booking',
  REVIEW_NOT_ALLOWED: 'You can only review completed bookings',
  CAR_NOT_AVAILABLE: 'This car is not available for booking',
  OWNER_ONLY: 'This action is only available to car owners',
  CUSTOMER_ONLY: 'This action is only available to customers',
} as const; 