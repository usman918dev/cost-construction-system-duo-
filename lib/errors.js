export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export function toJson(error) {
  if (error instanceof ApiError) {
    return {
      ok: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
      },
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err) => err.message);
    return {
      ok: false,
      error: {
        message: messages.join(', '),
        statusCode: 400,
      },
    };
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      ok: false,
      error: {
        message: `${field} already exists`,
        statusCode: 409,
      },
    };
  }

  // Generic error
  return {
    ok: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode: 500,
    },
  };
}
