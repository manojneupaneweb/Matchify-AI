import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import Result from '@/models/Result';
import User from '@/models/User';
import Stats from '@/models/Stats';

export async function GET() {
  try {
    const start = Date.now();
    await dbConnect();
    const dbPing = Date.now() - start;

    const [
      userCount,
      resultCount,
      statsCount,
      dbStats,
    ] = await Promise.all([
      User.estimatedDocumentCount(),
      Result.estimatedDocumentCount(),
      Stats.estimatedDocumentCount(),
      mongoose.connection.db.stats(),
    ]);

    const collections = [
      { name: 'users', documents: userCount, collection: 'users' },
      { name: 'results', documents: resultCount, collection: 'results' },
      { name: 'stats', documents: statsCount, collection: 'stats' },
    ];

    return NextResponse.json({
      status: 'healthy',
      dbPingMs: dbPing,
      dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      dbName: mongoose.connection.name,
      dataSize: dbStats.dataSize,
      storageSize: dbStats.storageSize,
      indexSize: dbStats.indexSize,
      collections,
      uptime: process.uptime(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
