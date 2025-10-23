import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    data: { message: 'Logged out successfully' },
  });

  // Delete cookie using Next.js cookies API
  response.cookies.delete('auth_token');

  return response;
}
