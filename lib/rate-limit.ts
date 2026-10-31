import { getEnv } from './env';
import { AppError } from './errors';
import { dbConnect } from './mongodb';
import RateLimit from '../models/RateLimit';

type Hit = { ok: boolean; retryAfter: number };

async function upstashHit(key: string, limit: number, windowMs: number): Promise<Hit | null> {
  const env = getEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  const response = await fetch(env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['INCR', key]),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { result?: number };
  const count = body.result ?? 1;
  if (count === 1) {
    await fetch(env.UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['PEXPIRE', key, windowMs]),
    });
  }
  return { ok: count <= limit, retryAfter: Math.ceil(windowMs / 1000) };
}

async function mongoHit(key: string, limit: number, windowMs: number): Promise<Hit> {
  await dbConnect();
  const now = new Date();
  const current = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true },
  ).lean<{ count: number; expiresAt: Date } | null>();

  if (!current) {
    const expiresAt = new Date(now.getTime() + windowMs);
    await RateLimit.findOneAndUpdate({ key }, { key, count: 1, expiresAt }, { upsert: true });
    return { ok: true, retryAfter: Math.ceil(windowMs / 1000) };
  }

  const retryAfter = Math.max(1, Math.ceil((new Date(current.expiresAt).getTime() - now.getTime()) / 1000));
  return { ok: current.count <= limit, retryAfter };
}

const scopeAnalyze = 'analyze';
const scopeWrite = 'write';

async function enforceRateLimit(scope: string, userKey: string, ip: string, message: string) {
  const env = getEnv();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const limit = env.RATE_LIMIT_MAX;
  for (const key of [`${scope}:user:${userKey}`, `${scope}:ip:${ip}`]) {
    const remote = await upstashHit(key, limit, windowMs).catch(() => null);
    const result = remote ?? (await mongoHit(key, limit, windowMs));
    if (!result.ok) {
      throw new AppError('RATE_LIMITED', message, 429, result.retryAfter);
    }
  }
}

export function clientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

export function enforceAnalyzeRateLimit(userKey: string, ip: string) {
  return enforceRateLimit(scopeAnalyze, userKey, ip, 'Too many analyses. Try again shortly.');
}

export function enforceWriteRateLimit(userKey: string, ip: string) {
  return enforceRateLimit(scopeWrite, userKey, ip, 'Too many requests. Try again shortly.');
}

export async function resetRateLimitMemory() {
  await dbConnect();
  await RateLimit.deleteMany({});
}
