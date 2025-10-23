import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import User from '@/models/User';
import Company from '@/models/Company';
import { signJwt, setAuthCookie } from '@/lib/auth';

async function handler(request) {
  const body = await request.json();

  // Validate required fields
  if (!body.name || !body.email || !body.password) {
    throw new ApiError('Name, email, and password are required', 400);
  }

  let companyId = body.companyId;

  // If registering with a new company, create it first
  if (body.companyName && !body.companyId) {
    const company = await Company.create({
      name: body.companyName,
      domain: body.companyDomain || '',
    });
    companyId = company._id.toString();
  }

  // Validate companyId exists
  if (!companyId) {
    throw new ApiError('Company ID or Company Name is required', 400);
  }

  // Check if company exists when joining existing company
  if (body.companyId && !body.companyName) {
    const companyExists = await Company.findById(body.companyId);
    if (!companyExists) {
      throw new ApiError('Company not found', 404);
    }
  }

  const user = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role || 'viewer',
    companyId,
  });

  // Get the final companyId as string
  const finalCompanyId = typeof user.companyId === 'string' 
    ? user.companyId 
    : user.companyId.toString();

  const token = signJwt({
    sub: user._id.toString(),
    role: user.role,
    companyId: finalCompanyId,
  });

  const response = NextResponse.json({
    ok: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: finalCompanyId,
      },
    },
  });

  // Set cookie using Next.js cookies API
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax', // Changed to lax for better compatibility with redirects
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}

export const POST = apiHandler(handler);
