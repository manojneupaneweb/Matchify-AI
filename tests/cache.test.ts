import { describe, expect, it } from 'vitest';
import { analysisKey, clearAnalysisCache, readAnalysisCache, withPrevious, writeAnalysisCache } from '../lib/agent/cache';

describe('analysis cache', () => {
  it('returns the same draft for the same resume and job description', () => {
    clearAnalysisCache();
    const key = analysisKey('resume text here', 'job description here');
    expect(analysisKey('resume text here', 'other job')).not.toBe(key);
    const draft = {
      score: 70,
      funnyMessage: 'Close.',
      critiqueIssues: [],
    } as never;
    writeAnalysisCache(key, draft);
    expect(readAnalysisCache(key)).toMatchObject({ score: 70 });
    expect(readAnalysisCache('missing')).toBeNull();
  });

  it('adds the score change without calling the model again', () => {
    const next = withPrevious({ score: 80, funnyMessage: 'Close.' }, 70);
    expect(next.scoreDelta).toBe(10);
    expect(next.funnyMessage).toMatch(/Up 10/);
  });
});
