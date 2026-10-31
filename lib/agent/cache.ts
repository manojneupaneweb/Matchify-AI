import { createHash } from 'node:crypto';
import AnalysisCache from '../../models/AnalysisCache';
import { dbConnect } from '../mongodb';
import type { AnalysisDraft } from '../ai/pipeline';

type Cached = AnalysisDraft & { critiqueIssues: string[] };

const HOUR_MS = 60 * 60 * 1000;

export function analysisKey(resumeText: string, jobDescription: string) {
  return createHash('sha256').update(resumeText).update('\n--\n').update(jobDescription).digest('hex');
}

export async function readAnalysisCache(key: string): Promise<Cached | null> {
  await dbConnect();
  const hit = await AnalysisCache.findOne({ key }).lean<{ value: Cached; createdAt: Date } | null>();
  if (!hit) return null;
  if (new Date(hit.createdAt).getTime() + HOUR_MS <= Date.now()) return null;
  return hit.value;
}

export async function writeAnalysisCache(key: string, value: Cached) {
  await dbConnect();
  await AnalysisCache.findOneAndUpdate(
    { key },
    { key, value, createdAt: new Date() },
    { upsert: true },
  );
}

export async function clearAnalysisCache() {
  await dbConnect();
  await AnalysisCache.deleteMany({});
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
