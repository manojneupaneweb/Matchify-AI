import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Result from '@/models/Result';
import Stats from '@/models/Stats';

export async function GET() {
  try {
    await dbConnect();

    const [
      totalUsers,
      totalAnalyses,
      totalAdmins,
      recentUsers,
      recentAnalyses,
      topScorers,
      globalStats,
      scoreDistribution,
      activityByDay,
    ] = await Promise.all([
      User.countDocuments(),
      Result.countDocuments(),
      User.countDocuments({ role: 'admin' }),

      // Most recent 5 users
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt lastLoginAt')
        .lean(),

      // Most recent 8 analyses
      Result.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('userEmail resumeName score createdAt')
        .lean(),

      // Top scorers
      Result.find()
        .sort({ score: -1 })
        .limit(5)
        .select('userEmail resumeName score createdAt')
        .lean(),

      // Global stats doc
      Stats.findOne({}).lean(),

      // Score distribution buckets
      Result.aggregate([
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 20, 40, 60, 80, 101],
            default: 'Other',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // Analyses per day (last 7 days)
      Result.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
    ]);

    const avgScore = await Result.aggregate([
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalAnalyses,
        totalAdmins,
        regularUsers: totalUsers - totalAdmins,
        avgScore: avgScore[0]?.avg?.toFixed(1) || 0,
        globalTotalUsers: globalStats?.totalUsers || 0,
        globalTotalAnalyses: globalStats?.totalAnalyses || 0,
      },
      recentUsers,
      recentAnalyses,
      topScorers,
      scoreDistribution,
      activityByDay,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load admin data' }, { status: 500 });
  }
}
