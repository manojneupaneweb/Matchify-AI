// TODO: this list is tiny. "postgres" works, "react native" does not.
const SYNONYMS: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  'react.js': 'react',
  reactjs: 'react',
  'react js': 'react',
  react: 'react',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  node: 'nodejs',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  py: 'python',
  python: 'python',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  'ci cd': 'cicd',
  'ci/cd': 'cicd',
  golang: 'go',
  go: 'go',
};

export function canonicalizeSkill(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[.]/g, '')
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9+# ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return '';
  return SYNONYMS[normalized] || normalized;
}

export function uniqueSkills(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = canonicalizeSkill(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export type ScoreInput = {
  mustHave: string[];
  niceToHave: string[];
  resumeSkills: string[];
  jdKeywords: string[];
  experienceAligned: boolean;
};

export type ScoreResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  breakdown: {
    mustHave: number;
    niceToHave: number;
    keywords: number;
    experience: number;
  };
};

function ratio(matched: number, total: number): number {
  if (total === 0) return 1;
  return matched / total;
}

export function scoreMatch(input: ScoreInput): ScoreResult {
  const must = uniqueSkills(input.mustHave);
  const nice = uniqueSkills(input.niceToHave).filter((skill) => !must.includes(skill));
  const resume = new Set(uniqueSkills(input.resumeSkills));
  const keywords = uniqueSkills(input.jdKeywords);

  const resumeEmpty = resume.size === 0;
  if (resumeEmpty) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [...must, ...nice],
      matchedKeywords: [],
      missingKeywords: keywords,
      breakdown: { mustHave: 0, niceToHave: 0, keywords: 0, experience: 0 },
    };
  }

  const matchedMust = must.filter((skill) => resume.has(skill));
  const missingMust = must.filter((skill) => !resume.has(skill));
  const matchedNice = nice.filter((skill) => resume.has(skill));
  const missingNice = nice.filter((skill) => !resume.has(skill));
  const matchedKeywords = keywords.filter((skill) => resume.has(skill));
  const missingKeywords = keywords.filter((skill) => !resume.has(skill));

  const mustRatio = ratio(matchedMust.length, must.length);
  const niceRatio = ratio(matchedNice.length, nice.length);
  const keywordRatio = ratio(matchedKeywords.length, keywords.length);
  const experience = input.experienceAligned ? 1 : 0;

  const score = Math.round(100 * (0.5 * mustRatio + 0.2 * niceRatio + 0.2 * keywordRatio + 0.1 * experience));

  return {
    score,
    matchedSkills: [...matchedMust, ...matchedNice],
    missingSkills: [...missingMust, ...missingNice],
    matchedKeywords,
    missingKeywords,
    breakdown: {
      mustHave: Math.round(mustRatio * 100),
      niceToHave: Math.round(niceRatio * 100),
      keywords: Math.round(keywordRatio * 100),
      experience: experience * 100,
    },
  };
}

export function experienceAligned(level: string, years: number[]): boolean {
  const normalized = level.toLowerCase();
  if (!normalized || normalized === 'unknown' || normalized === 'any') return true;
  const maxYears = years.length ? Math.max(...years) : 0;
  if (normalized.includes('senior') || normalized.includes('lead') || normalized.includes('staff')) {
    return maxYears >= 5;
  }
  if (normalized.includes('mid')) return maxYears >= 2;
  if (normalized.includes('junior') || normalized.includes('entry')) return true;
  return true;
}
