import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const [recentAnalyses, recentUsers] = await Promise.all([
      Result.find().sort({ createdAt: -1 }).limit(25).select('userEmail resumeName score createdAt').lean(),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email role createdAt').lean(),
    ]);

    // Interleave them into a unified activity feed
    const feed = [
      ...recentAnalyses.map(a => ({
        type: 'analysis',
        user: a.userEmail,
        detail: `Analyzed "${a.resumeName}"`,
        score: a.score,
        at: a.createdAt,
      })),
      ...recentUsers.map(u => ({
        type: 'signup',
        user: u.email,
        detail: `New ${u.role} account registered`,
        score: null,
        at: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 30);

    return NextResponse.json({ feed });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load activity' }, { status: 500 });
  }
}
