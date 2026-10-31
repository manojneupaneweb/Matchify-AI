import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    const connected = mongoose.connection.readyState === 1;
    return NextResponse.json({
      status: connected ? 'ok' : 'degraded',
      db: connected ? 'up' : 'down',
    });
  } catch {
    return NextResponse.json({ status: 'degraded', db: 'down' }, { status: 503 });
  }
}
