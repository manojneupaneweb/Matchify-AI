import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';

  try {
    await dbConnect();

    const query = {};
    if (search) {
      query.userEmail = { $regex: search, $options: 'i' };
    }

    const [analyses, total] = await Promise.all([
      Result.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('userEmail resumeName score missingKeywords strengths weaknesses createdAt')
        .lean(),
      Result.countDocuments(query),
    ]);

    return NextResponse.json({ analyses, total, page, limit });
  } catch (error) {
    console.error('Admin analyses error:', error);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}
