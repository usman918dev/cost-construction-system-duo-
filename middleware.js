import { NextResponse } from 'next/server';
import { verifyJwt } from './lib/auth';

const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/register'];
const publicAssets = ['/_next', '/favicon.ico', '/public'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // AUTHENTICATION DISABLED FOR 1 HOUR - Allow all routes
  return NextResponse.next();

  // Allow public assets
  if (publicAssets.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication first
  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? verifyJwt(token) : null;

  // If authenticated and trying to access login/signup, redirect to home
  if (payload && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow public paths for non-authenticated users
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!payload) {
    // Invalid token, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }

  // Authenticated user accessing protected route
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
