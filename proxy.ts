import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { decrypt } from '@/lib/auth';

async function identity(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token?.email && typeof token.email === 'string') {
    return {
      email: token.email,
      role: typeof token.role === 'string' ? token.role : 'user',
    };
  }
  const custom = req.cookies.get('session')?.value;
  if (custom) {
    const payload = await decrypt(custom);
    if (typeof payload?.email === 'string') {
      return {
        email: payload.email,
        role: typeof payload.role === 'string' ? payload.role : 'user',
      };
    }
  }
  if (process.env.E2E_AUTH_BYPASS === '1' && process.env.NODE_ENV !== 'production') {
    const email = req.cookies.get('e2e_user')?.value;
    if (email) return { email, role: req.cookies.get('e2e_role')?.value || 'user' };
  }
  return null;
}

function isAdmin(person: { email: string; role: string }) {
  if (person.role === 'admin') return true;
  const allow = process.env.ADMIN_EMAIL;
  return Boolean(allow && person.email.toLowerCase() === allow.toLowerCase());
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const person = await identity(req);
  const wantsAdmin = path.startsWith('/admin') || path.startsWith('/api/admin');
  const wantsUser =
    path.startsWith('/dashboard') ||
    path.startsWith('/profile') ||
    path.startsWith('/api/analyze') ||
    path.startsWith('/api/user');

  if (wantsAdmin) {
    if (!person || !isAdmin(person)) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Admin access is required.' } },
          { status: person ? 403 : 401 },
        );
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (wantsUser && !person) {
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/admin/:path*',
    '/api/analyze',
    '/api/user/:path*',
  ],
};
