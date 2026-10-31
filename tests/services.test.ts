import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(async (doc: { userId: string }) => ({ _id: 'result-id', ...doc })),
  deleteMany: vi.fn(async () => ({ deletedCount: 3 })),
  findOne: vi.fn(async () => ({ _id: 'result-id', score: 10 })),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn(async () => ({})),
  dbConnect: vi.fn(async () => ({})),
}));

vi.mock('@/models/Result', () => ({
  default: {
    create: mocks.create,
    deleteMany: mocks.deleteMany,
    findOne: () => ({ lean: mocks.findOne }),
  },
}));
vi.mock('@/models/Stats', () => ({
  default: { findOneAndUpdate: vi.fn(async () => ({})) },
}));

import { AppError } from '../lib/errors';
import { errorResponse } from '../lib/http';
import { encrypt, decrypt } from '../lib/auth';
import { deleteUserAnalyses, saveAnalysis } from '../lib/services/analysis';
import { logger } from '../lib/logger';

describe('http errors', () => {
  it('hides unexpected errors and formats app errors', async () => {
    const limited = errorResponse(new AppError('RATE_LIMITED', 'slow down', 429, 12));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBe('12');
    const body = await limited.json();
    expect(body.error.code).toBe('RATE_LIMITED');

    const internal = errorResponse(new Error('secret stack'));
    const internalBody = await internal.json();
    expect(internal.status).toBe(500);
    expect(JSON.stringify(internalBody)).not.toContain('secret stack');
  });
});

describe('auth tokens', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'jwt-secret';
  });

  it('round-trips a payload and rejects a bad token', async () => {
    const token = await encrypt({ email: 'a@b.c', role: 'user' });
    const payload = await decrypt(token);
    expect(payload?.email).toBe('a@b.c');
    expect(await decrypt('nope')).toBeNull();
  });
});

describe('analysis service', () => {
  it('stores the draft without a resume file', async () => {
    const doc = await saveAnalysis({
      userEmail: 'a@b.c',
      resumeName: 'cv.pdf',
      jobDescription: 'Need JavaScript and React in a product team for production work.',
      draft: {
        score: 80,
        improvedScore: 88,
        funnyMessage: 'Nice',
        strengths: ['JS'],
        weaknesses: [],
        suggestions: [],
        missingKeywords: [],
        matchedSkills: ['javascript'],
        missingSkills: [],
        rewrites: [],
        rewrittenSummary: 'summary',
        charts: { skillsMatch: {}, keywordCoverage: { Matched: 1, Missing: 0 } },
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        steps: [],
        model: 'primary-model',
        requirements: {
          mustHaveSkills: [],
          niceToHaveSkills: [],
          keywords: [],
          experienceLevel: 'junior',
          domain: '',
        },
        profile: { skills: [], experience: [], education: [], summary: '' },
      },
    });
    expect(doc.userId).toBe('a@b.c');
    expect(mocks.create).toHaveBeenCalled();
    expect(await deleteUserAnalyses('a@b.c')).toBe(3);
  });
});

describe('logger', () => {
  it('writes warning and error lines', () => {
    logger.warn('warn-line');
    logger.error('error-line');
  });
});
