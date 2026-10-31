import { describe, expect, it } from 'vitest';
import { canonicalizeSkill, experienceAligned, scoreMatch, uniqueSkills } from '../lib/scoring';

const full = {
  mustHave: ['JavaScript', 'React'],
  niceToHave: ['Kubernetes'],
  resumeSkills: ['javascript', 'react.js', 'k8s'],
  jdKeywords: ['React', 'Node.js'],
  experienceAligned: true,
};

describe('scoreMatch', () => {
  it('scores an empty resume as 0', () => {
    const result = scoreMatch({ ...full, resumeSkills: [] });
    expect(result.score).toBe(0);
    expect(result.matchedSkills).toEqual([]);
  });

  it('scores a complete match as 100', () => {
    const result = scoreMatch({
      ...full,
      resumeSkills: ['JavaScript', 'React', 'Kubernetes', 'Node.js'],
    });
    expect(result.score).toBe(100);
    expect(result.missingSkills).toEqual([]);
  });

  it('scores a total miss as 0 when the resume has unrelated skills', () => {
    const result = scoreMatch({
      ...full,
      resumeSkills: ['gardening'],
      experienceAligned: false,
    });
    expect(result.score).toBe(0);
    expect(result.missingSkills).toContain('javascript');
  });

  it('dedupes skills and treats synonyms as the same skill', () => {
    expect(canonicalizeSkill('React.js')).toBe('react');
    expect(uniqueSkills(['JS', 'javascript', 'JS'])).toEqual(['javascript']);
    const result = scoreMatch({
      mustHave: ['JS', 'javascript'],
      niceToHave: [],
      resumeSkills: ['JavaScript'],
      jdKeywords: [],
      experienceAligned: true,
    });
    expect(result.breakdown.mustHave).toBe(100);
    expect(result.missingSkills).toEqual([]);
  });

  it('weights must-have skills more than nice-to-have skills', () => {
    const missingMust = scoreMatch({
      mustHave: ['python'],
      niceToHave: ['react'],
      resumeSkills: ['react'],
      jdKeywords: [],
      experienceAligned: true,
    });
    const missingNice = scoreMatch({
      mustHave: ['python'],
      niceToHave: ['react'],
      resumeSkills: ['python'],
      jdKeywords: [],
      experienceAligned: true,
    });
    expect(missingNice.score).toBeGreaterThan(missingMust.score);
  });
});

describe('experienceAligned', () => {
  it('requires more years for senior roles', () => {
    expect(experienceAligned('senior', [2])).toBe(false);
    expect(experienceAligned('senior', [6])).toBe(true);
    expect(experienceAligned('unknown', [])).toBe(true);
  });
});
