import { NextResponse } from 'next/server';
import { isAppError } from './errors';
import { logger } from './logger';

export function errorResponse(error: unknown) {
  if (isAppError(error)) {
    const headers: Record<string, string> = {};
    if (error.code === 'RATE_LIMITED' && typeof error.details === 'number') {
      headers['Retry-After'] = String(error.details);
    }
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers },
    );
  }
  logger.error('unhandled error', {
    name: error instanceof Error ? error.name : 'unknown',
    message: error instanceof Error ? error.message : 'unknown',
  });
  return NextResponse.json(
    { error: { code: 'INTERNAL', message: 'Something broke on the server. Try again.' } },
    { status: 500 },
  );
}
