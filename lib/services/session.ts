import { getServerSession } from 'next-auth/next';
import { cookies } from 'next/headers';
import { authOptions } from '../authOptions';
import { decrypt } from '../auth';
import { AppError } from '../errors';
import { getEnv } from '../env';
import dbConnect from '../mongodb';
import User from '@/models/User';

export type CurrentUser = {
  email: string;
  role: string;
  name?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  let email = session?.user?.email ?? null;
  let role = session?.user?.role ?? 'user';
  let name = session?.user?.name ?? null;

  if (!email) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (token) {
      const payload = await decrypt(token);
      if (typeof payload?.email === 'string') {
        email = payload.email;
        role = typeof payload.role === 'string' ? payload.role : 'user';
        name = typeof payload.name === 'string' ? payload.name : null;
      }
    }
  }

  if (!email && getEnv().E2E_AUTH_BYPASS === '1' && getEnv().NODE_ENV !== 'production') {
    const cookieStore = await cookies();
    const bypass = cookieStore.get('e2e_user')?.value;
    if (bypass) {
      email = bypass;
      role = cookieStore.get('e2e_role')?.value || 'user';
    }
  }

  if (!email) return null;

  await dbConnect();
  const doc = await User.findOne({ email }).select('role name').lean<{ role?: string; name?: string } | null>();
  if (doc?.role) role = doc.role;
  const adminEmail = getEnv().ADMIN_EMAIL;
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) role = 'admin';
  return { email, role, name: doc?.name || name };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AppError('UNAUTHORIZED', 'Please sign in.', 401);
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== 'admin') throw new AppError('FORBIDDEN', 'Admin access is required.', 403);
  return user;
}
