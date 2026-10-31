import { beforeEach, describe, expect, it, vi } from 'vitest';

const rows = new Map<string, { count: number; expiresAt: Date }>();

vi.mock('../lib/mongodb', () => ({
  dbConnect: vi.fn(async () => ({})),
  default: vi.fn(async () => ({})),
}));

vi.mock('../models/RateLimit', () => ({
  default: {
    findOneAndUpdate(
      query: { key: string; expiresAt?: { $gt: Date } },
      update: { $inc?: { count: number }; count?: number; expiresAt?: Date },
    ) {
      const row = rows.get(query.key);
      const open = Boolean(row && query.expiresAt && row.expiresAt > query.expiresAt.$gt);
      if (update.$inc) {
        if (!open || !row) return { lean: async () => null };
        row.count += update.$inc.count;
        return { lean: async () => ({ ...row }) };
      }
      rows.set(query.key, { count: update.count ?? 1, expiresAt: update.expiresAt ?? new Date() });
      return { lean: async () => rows.get(query.key) ?? null };
    },
    async deleteMany() {
      rows.clear();
    },
  },
}));

import { resetEnvCache } from '../lib/env';
import { enforceAnalyzeRateLimit, resetRateLimitMemory } from '../lib/rate-limit';

describe('rate limiter', () => {
  beforeEach(async () => {
    rows.clear();
    process.env.RATE_LIMIT_MAX = '2';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/matchify';
    process.env.NEXTAUTH_SECRET = 'nextauth-secret';
    process.env.JWT_SECRET = 'jwt-secret';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    resetEnvCache();
    await resetRateLimitMemory();
  });

  it('allows requests under the limit, blocks the next one, and allows again after reset', async () => {
    await enforceAnalyzeRateLimit('ada@example.com', '10.0.0.1');
    await enforceAnalyzeRateLimit('ada@example.com', '10.0.0.1');
    await expect(enforceAnalyzeRateLimit('ada@example.com', '10.0.0.1')).rejects.toMatchObject({
      status: 429,
      code: 'RATE_LIMITED',
    });
    await resetRateLimitMemory();
    await enforceAnalyzeRateLimit('ada@example.com', '10.0.0.1');
  });
});
