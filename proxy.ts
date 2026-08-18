import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js 16 Standard: The function name must be exactly 'proxy'
export function proxy(request: NextRequest) {
  const session = request.cookies.get('auth_session');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // If a visitor has no active login token, kick them to the secure gate screen
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If they are already authenticated, bypass the form gate entirely
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Enforces network routing safety boundaries for everything except assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
