import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  const token = request.cookies.get('fincast_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
