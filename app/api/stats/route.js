import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stats from '@/models/Stats';

export async function GET() {
  try {
    await dbConnect();
    let stats = await Stats.findOne({});
    if (!stats) {
      stats = await Stats.create({ totalUsers: 0, totalAnalyses: 0 });
    }
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const stats = await Stats.findOneAndUpdate({}, { $inc: { totalUsers: 1 } }, { upsert: true, returnDocument: 'after' });
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user stats' }, { status: 500 });
  }
}
