import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    data: { message: 'Logged out successfully' },
  });

  response.headers.set('Set-Cookie', clearAuthCookie());

  return response;
}
