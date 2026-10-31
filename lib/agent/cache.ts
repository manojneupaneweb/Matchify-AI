import { createHash } from 'node:crypto';
import type { AnalysisDraft } from '../ai/pipeline';

type Cached = AnalysisDraft & { critiqueIssues: string[] };

const store = new Map<string, { at: number; value: Cached }>();
const TTL_MS = 60 * 60 * 1000;
const MAX = 100;

export function analysisKey(resumeText: string, jobDescription: string) {
  return createHash('sha256').update(resumeText).update('\n--\n').update(jobDescription).digest('hex');
}

export function readAnalysisCache(key: string): Cached | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function writeAnalysisCache(key: string, value: Cached) {
  if (store.size >= MAX) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, { at: Date.now(), value });
}

export function clearAnalysisCache() {
  store.clear();
}

export function withPrevious<T extends { score: number; funnyMessage: string }>(
  draft: T,
  previousScore: number | null,
): T & { previousScore: number | null; scoreDelta: number | null } {
  if (previousScore == null) {
    return { ...draft, previousScore: null, scoreDelta: null };
  }
  const scoreDelta = draft.score - previousScore;
  const note =
    scoreDelta === 0
      ? ' Same score as your last run.'
      : ` ${scoreDelta > 0 ? 'Up' : 'Down'} ${Math.abs(scoreDelta)} points from your last run.`;
  return {
    ...draft,
    previousScore,
    scoreDelta,
    funnyMessage: `${draft.funnyMessage}${note}`.trim(),
  };
}
