import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Result from '@/models/Result';
import { NextResponse } from 'next/server';

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const email = session.user.email;

    // Delete all user analyses/results
    await Result.deleteMany({ userEmail: email });

    // Delete the user account
    await User.findOneAndDelete({ email });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
