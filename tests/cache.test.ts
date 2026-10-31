import { beforeEach, describe, expect, it, vi } from 'vitest';

const rows = new Map<string, { value: unknown; createdAt: Date }>();

vi.mock('../lib/mongodb', () => ({
  dbConnect: vi.fn(async () => ({})),
}));

vi.mock('../models/AnalysisCache', () => ({
  default: {
    findOne(query: { key: string }) {
      const row = rows.get(query.key) ?? null;
      return { lean: async () => row };
    },
    async findOneAndUpdate(query: { key: string }, doc: { value: unknown; createdAt: Date }) {
      rows.set(query.key, { value: doc.value, createdAt: doc.createdAt });
    },
    async deleteMany() {
      rows.clear();
    },
  },
}));

import { analysisKey, clearAnalysisCache, readAnalysisCache, withPrevious, writeAnalysisCache } from '../lib/agent/cache';

describe('analysis cache', () => {
  beforeEach(async () => {
    rows.clear();
    await clearAnalysisCache();
  });

  it('returns the same draft for the same resume and job description', async () => {
    const key = analysisKey('resume text here', 'job description here');
    expect(analysisKey('resume text here', 'other job')).not.toBe(key);
    const draft = {
      score: 70,
      funnyMessage: 'Close.',
      critiqueIssues: [],
    } as never;
    await writeAnalysisCache(key, draft);
    expect(await readAnalysisCache(key)).toMatchObject({ score: 70 });
    expect(await readAnalysisCache('missing')).toBeNull();
  });

  it('ignores a row older than one hour', async () => {
    rows.set('stale', { value: { score: 1 }, createdAt: new Date(Date.now() - 61 * 60 * 1000) });
    expect(await readAnalysisCache('stale')).toBeNull();
  });

  it('adds the score change without calling the model again', () => {
    const next = withPrevious({ score: 80, funnyMessage: 'Close.' }, 70);
    expect(next.scoreDelta).toBe(10);
    expect(next.funnyMessage).toMatch(/Up 10/);
  });
});
