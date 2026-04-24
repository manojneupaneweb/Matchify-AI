import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    // Increment tokenVersion — invalidates ALL existing JWTs for this user
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $inc: { tokenVersion: 1 } }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout all error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
