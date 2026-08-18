import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Verify system credentials securely on the server-side
    if (username === 'admin' && password === 'kobin123') {
      const response = NextResponse.json({ success: true });

      // Inject the authentication cookie straight into the HTTP response header
      response.cookies.set({
        name: 'auth_session',
        value: 'true',
        httpOnly: true,     // Protects against script-injection hacks
        path: '/',
        maxAge: 86400,      // Valid for exactly 24 hours
        sameSite: 'lax',    // Bypasses strict local browser block policies
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error parsing packet.' }, { status: 500 });
  }
}
