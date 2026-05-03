import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since1h  = new Date(Date.now() - 60 * 60 * 1000);

    const [newUsers, highScores, recentAnalyses, totalUsers, totalResults] = await Promise.all([
      // New signups in last 24h
      User.find({ createdAt: { $gte: since24h } })
        .sort({ createdAt: -1 })
        .select('name email role createdAt')
        .lean(),

      // High scores (≥85) in last 24h
      Result.find({ score: { $gte: 85 }, createdAt: { $gte: since24h } })
        .sort({ score: -1 })
        .limit(5)
        .select('userEmail resumeName score createdAt')
        .lean(),

      // Any analyses in last 1h
      Result.find({ createdAt: { $gte: since1h } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('userEmail resumeName score createdAt')
        .lean(),

      User.estimatedDocumentCount(),
      Result.estimatedDocumentCount(),
    ]);

    // Build unified notification list
    const notifications = [];

    // New user signups
    newUsers.forEach(u => {
      notifications.push({
        id: `user-${u._id}`,
        type: 'signup',
        title: 'New User Registered',
        body: u.name ? `${u.name} (${u.email})` : u.email,
        meta: u.role === 'admin' ? 'Admin account' : 'Regular user',
        at: u.createdAt,
        priority: u.role === 'admin' ? 'high' : 'normal',
      });
    });

    // High score achievements
    highScores.forEach(r => {
      notifications.push({
        id: `score-${r._id}`,
        type: 'highscore',
        title: `🏆 High Score: ${r.score}%`,
        body: r.userEmail,
        meta: r.resumeName,
        at: r.createdAt,
        priority: r.score >= 95 ? 'high' : 'normal',
      });
    });

    // Recent analyses (last 1h)
    recentAnalyses.forEach(r => {
      notifications.push({
        id: `analysis-${r._id}`,
        type: 'analysis',
        title: 'Resume Analyzed',
        body: r.userEmail,
        meta: `Score: ${r.score}% · ${r.resumeName}`,
        at: r.createdAt,
        priority: 'low',
      });
    });

    // Sort by most recent
    notifications.sort((a, b) => new Date(b.at) - new Date(a.at));

    // System-level alert if totals look off
    if (totalResults === 0) {
      notifications.unshift({
        id: 'sys-no-data',
        type: 'system',
        title: 'No Analyses Yet',
        body: 'Platform has no resume scans recorded.',
        meta: 'Check analysis pipeline',
        at: new Date(),
        priority: 'high',
      });
    }

    return NextResponse.json({
      notifications: notifications.slice(0, 20),
      unread: notifications.length,
      summary: {
        newUsersToday: newUsers.length,
        highScoresToday: highScores.length,
        analysesThisHour: recentAnalyses.length,
        totalUsers,
        totalResults,
      }
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json({ notifications: [], unread: 0, error: error.message }, { status: 500 });
  }
}
