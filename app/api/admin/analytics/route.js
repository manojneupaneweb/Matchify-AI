import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const [
      scoresByDay,
      userGrowth,
      topKeywords,
      avgScoreByUser,
      analysesPerHour,
    ] = await Promise.all([
      // Avg score per day (last 30 days)
      Result.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // User registrations per day (last 30 days)
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      // Top missing keywords
      Result.aggregate([
        { $unwind: '$missingKeywords' },
        { $group: { _id: '$missingKeywords', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),

      // Users with most analyses
      Result.aggregate([
        { $group: { _id: '$userEmail', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Analyses per hour of day (all time)
      Result.aggregate([
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
    ]);

    return NextResponse.json({ scoresByDay, userGrowth, topKeywords, avgScoreByUser, analysesPerHour });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
