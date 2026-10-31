import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const [
      scoreBreakdown,
      topUsers,
      recentHighScores,
      weeklyComparison,
    ] = await Promise.all([
      // Score band breakdown
      Result.aggregate([
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 20, 40, 60, 80, 101],
            default: 'Other',
            output: { count: { $sum: 1 }, avgScore: { $avg: '$score' } }
          }
        }
      ]),

      // Top users by average score (min 2 analyses)
      Result.aggregate([
        { $group: { _id: '$userEmail', avgScore: { $avg: '$score' }, count: { $sum: 1 }, maxScore: { $max: '$score' } } },
        { $match: { count: { $gte: 1 } } },
        { $sort: { avgScore: -1 } },
        { $limit: 10 }
      ]),

      // Recent high scores (>=80)
      Result.find({ score: { $gte: 80 } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('userEmail resumeName score createdAt')
        .lean(),

      // This week vs last week
      Result.aggregate([
        {
          $facet: {
            thisWeek: [
              { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
              { $group: { _id: null, count: { $sum: 1 }, avgScore: { $avg: '$score' } } }
            ],
            lastWeek: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                    $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              },
              { $group: { _id: null, count: { $sum: 1 }, avgScore: { $avg: '$score' } } }
            ]
          }
        }
      ]),
    ]);

    return NextResponse.json({ scoreBreakdown, topUsers, recentHighScores, weeklyComparison: weeklyComparison[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}
