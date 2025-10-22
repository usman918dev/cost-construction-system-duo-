import { NextResponse } from 'next/server';
import { ApiError, toJson } from './errors.js';
import connectDB from './db.js';

export function apiHandler(handler, options = {}) {
  return async (request, context) => {
    try {
      // Connect to database
      await connectDB();

      // Validate request body if validator is provided
      if (options.validator && request.method !== 'GET' && request.method !== 'DELETE') {
        const body = await request.json();
        const validationResult = options.validator.safeParse(body);

        if (!validationResult.success) {
          const errorMessage = validationResult.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          throw new ApiError(errorMessage, 400);
        }

        // Attach validated data to request for use in handler
        request.validatedData = validationResult.data;

        // Create a new request with the body for the handler
        request.json = async () => validationResult.data;
      }

      // Call the actual handler
      const result = await handler(request, context);

      // If result is already a Response, return it
      if (result instanceof Response) {
        return result;
      }

      // Otherwise wrap in success response
      return NextResponse.json({ ok: true, data: result });
    } catch (error) {
      console.error('API Error:', error);
      const errorResponse = toJson(error);
      return NextResponse.json(errorResponse, {
        status: errorResponse.error.statusCode,
      });
    }
  };
}
