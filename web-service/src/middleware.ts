import { NextResponse } from 'next/server';
import * as jose from 'jose';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // service token for backend-engine
  const serviceToken = request.headers.get('x-service-token');
  console.log('Service token received:', serviceToken ? 'present' : 'missing');
  console.log('Expected service token:', process.env.SERVICE_TOKEN ? 'set' : 'not set');
  
  if (serviceToken === process.env.SERVICE_TOKEN) {
    console.log('Service token authentication successful');
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // Check if the request is for an API route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow access to login and register endpoints
    if (request.nextUrl.pathname === '/api/auth/login' || 
        request.nextUrl.pathname === '/api/auth/register') {
      return NextResponse.next();
    }

    // For other API routes, verify the token
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jose.jwtVerify(token, secret);
      
      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  // For non-API routes, handle authentication and redirects
  if (!token) {
    // Redirect to login if accessing protected routes
    if (request.nextUrl.pathname.startsWith('/profile') || 
        request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    await jose.jwtVerify(token, secret);
    
    // If user is authenticated and tries to access login/register, redirect to profile
    if (request.nextUrl.pathname === '/login' || 
        request.nextUrl.pathname === '/register') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    if (request.nextUrl.pathname.startsWith('/profile') || 
        request.nextUrl.pathname.startsWith('/settings')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/register'
  ],
}; 