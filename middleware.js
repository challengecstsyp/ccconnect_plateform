import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/about', '/contact', '/reset-password', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth');
  
  // Protected routes
  const protectedRoutes = ['/dashboard', '/company'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // For protected routes, let client-side handle auth checks
  // Middleware can't access localStorage, so we'll rely on client-side guards
  // This allows the page to load and check auth on the client
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
