import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { registerSchema, registerWithCompanySchema } from '@/lib/validators/auth';
import User from '@/models/User';
import Company from '@/models/Company';
import { signJwt, setAuthCookie } from '@/lib/auth';

async function handler(request) {
  const body = await request.json();

  let companyId = body.companyId;

  // If registering with a new company, create it first
  if (body.companyName && !body.companyId) {
    const company = await Company.create({
      name: body.companyName,
      domain: body.companyDomain || '',
    });
    companyId = company._id.toString();
  }

  const user = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role || 'viewer',
    companyId,
  });

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

// Accept both schemas - will validate based on whether companyId or companyName is provided
export const POST = apiHandler(handler);
