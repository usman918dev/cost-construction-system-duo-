import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { loginSchema } from '@/lib/validators/auth';
import { ApiError } from '@/lib/errors';
import User from '@/models/User';
import { signJwt, setAuthCookie } from '@/lib/auth';

async function handler(request) {
  const { email, password } = await request.json();

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError('Invalid email or password', 401);
  }

  // Ensure companyId is a string
  const companyIdString = typeof user.companyId === 'string' 
    ? user.companyId 
    : user.companyId.toString();

  const token = signJwt({
    sub: user._id.toString(),
    role: user.role,
    companyId: companyIdString,
  });

  const response = NextResponse.json({
    ok: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: companyIdString,
      },
    },
  });

  // Set cookie using Next.js cookies API
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: false, // false for localhost
    sameSite: 'lax', // Changed to lax for better compatibility with redirects
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}

export const POST = apiHandler(handler, { validator: loginSchema });
