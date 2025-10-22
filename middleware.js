import { NextResponse } from 'next/server';
import { parse } from 'cookie';
import { verifyJwt } from './lib/auth';

const publicPaths = ['/login', '/api/auth/login', '/api/auth/register'];
const publicAssets = ['/_next', '/favicon.ico', '/public'];

export function middleware(request) {
  // AUTHENTICATION TEMPORARILY DISABLED FOR TESTING
  // TODO: Re-enable authentication after testing UI and functionality
  return NextResponse.next();

  /* ORIGINAL AUTH CODE - COMMENTED OUT FOR TESTING
  const { pathname } = request.nextUrl;

  // Allow public assets
  if (publicAssets.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const cookies = parse(request.headers.get('cookie') || '');
  const token = cookies.auth_token;

  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = verifyJwt(token);

  if (!payload) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Set-Cookie', 'auth_token=; Path=/; Max-Age=0');
    return response;
  }

  // If authenticated and trying to access login, redirect to home
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
