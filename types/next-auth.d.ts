import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    error?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      lastLoginAt?: string | null;
      tokenVersion?: number;
    };
  }

  interface User {
    lastLoginAt?: string | null;
    tokenVersion?: number;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    error?: string;
    lastLoginAt?: string | null;
    tokenVersion?: number;
    role?: string;
  }
}
