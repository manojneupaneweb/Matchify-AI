import { getEnv } from './env';
import { AppError } from './errors';

type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();

function memoryHit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: Math.ceil(windowMs / 1000) };
  }
  current.count += 1;
  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return { ok: current.count <= limit, retryAfter };
}

async function upstashHit(key: string, limit: number, windowMs: number) {
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

const scopeAnalyze = 'analyze';
const scopeWrite = 'write';

async function enforceRateLimit(scope: string, userKey: string, ip: string, message: string) {
  const env = getEnv();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const limit = env.RATE_LIMIT_MAX;
  for (const key of [`${scope}:user:${userKey}`, `${scope}:ip:${ip}`]) {
    const remote = await upstashHit(key, limit, windowMs).catch(() => null);
    const result = remote ?? memoryHit(key, limit, windowMs);
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

export function resetRateLimitMemory() {
  memory.clear();
}
