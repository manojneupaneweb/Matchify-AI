import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { decrypt } from '@/lib/auth';

export async function middleware(req) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    let email = null;

    // 1. Try NextAuth token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token?.email) {
      email = token.email;
    } else {
      // 2. Try custom JWT
      const customToken = req.cookies.get('auth_token')?.value;
      if (customToken) {
        try {
          const payload = await decrypt(customToken);
          if (payload?.email) {
            email = payload.email;
          }
        } catch (e) {}
      }
    }

    // Only allow randome255@gmail.com
    if (email !== 'randome255@gmail.com') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect /dashboard routes
  if (path.startsWith('/dashboard')) {
    let isAuthenticated = false;

    // 1. Try NextAuth token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      isAuthenticated = true;
    } else {
      // 2. Try custom JWT
      const customToken = req.cookies.get('auth_token')?.value;
      if (customToken) {
        try {
          const payload = await decrypt(customToken);
          if (payload) {
            isAuthenticated = true;
          }
        } catch (e) {}
      }
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
