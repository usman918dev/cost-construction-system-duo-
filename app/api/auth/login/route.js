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

  const token = signJwt({
    sub: user._id.toString(),
    role: user.role,
    companyId: user.companyId.toString(),
  });

  const response = NextResponse.json({
    ok: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    },
  });

  response.headers.set('Set-Cookie', setAuthCookie(token));

  return response;
}

export const POST = apiHandler(handler, { validator: loginSchema });
