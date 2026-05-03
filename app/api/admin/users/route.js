import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Result from '@/models/Result';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || '';

  try {
    await dbConnect();

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-password -tokenVersion')
        .lean(),
      User.countDocuments(query),
    ]);

    // Enrich with per-user analysis count
    const enriched = await Promise.all(users.map(async (u) => {
      const analysisCount = await Result.countDocuments({ userEmail: u.email });
      const topResult = await Result.findOne({ userEmail: u.email }).sort({ score: -1 }).select('score').lean();
      return { ...u, analysisCount, topScore: topResult?.score || null };
    }));

    return NextResponse.json({ users: enriched, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
