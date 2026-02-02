// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check if trying to access protected API routes
  if (request.nextUrl.pathname.startsWith('/api/query') || 
      request.nextUrl.pathname.startsWith('/api/schema')) {
    
    // Check for the Guest Cookie OR a User Auth Token
    const guestSession = request.cookies.get('db_session_guest');
    const userSession = request.cookies.get('auth_token');

    if (!guestSession && !userSession) {
      return NextResponse.json(
        { error: 'Unauthorized: No active database connection found.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};