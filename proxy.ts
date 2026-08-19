import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('auth_session');
  const { pathname } = request.nextUrl;

  // FIX: Explicitly allow Next.js internal core files to load.
  // Without this guard line, Next.js blocks its own code engine, causing a black screen!
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/login';

  // If a visitor has no active login token, redirect them to the secure login page
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If they are already logged in and try to go to the login screen, jump them to the dashboard
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Enforces network routing safety boundaries for everything except static images
  matcher: ['/((?!static|favicon.ico).*)'],
};
