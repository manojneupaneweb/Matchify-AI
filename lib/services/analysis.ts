import dbConnect from '../mongodb';
import Result from '@/models/Result';
import Stats from '@/models/Stats';
import type { AnalysisDraft } from '../ai/pipeline';

export async function saveAnalysis(input: {
  userEmail: string;
  resumeName: string;
  jobDescription: string;
  draft: AnalysisDraft;
}) {
  await dbConnect();
  await Stats.findOneAndUpdate({}, { $inc: { totalAnalyses: 1 } }, { upsert: true });
  const doc = await Result.create({
    userId: input.userEmail,
    userEmail: input.userEmail,
    resumeName: input.resumeName,
    jobDescription: input.jobDescription.slice(0, 20_000),
    score: input.draft.score,
    previousScore: 'previousScore' in input.draft ? (input.draft as { previousScore?: number | null }).previousScore : null,
    scoreDelta: 'scoreDelta' in input.draft ? (input.draft as { scoreDelta?: number | null }).scoreDelta : null,
    improvedScore: input.draft.improvedScore,
    funnyMessage: input.draft.funnyMessage,
    strengths: input.draft.strengths,
    weaknesses: input.draft.weaknesses,
    suggestions: input.draft.suggestions,
    missingKeywords: input.draft.missingKeywords,
    matchedSkills: input.draft.matchedSkills,
    missingSkills: input.draft.missingSkills,
    rewrites: input.draft.rewrites,
    rewrittenSummary: input.draft.rewrittenSummary,
    charts: input.draft.charts,
    model: input.draft.model,
    usage: input.draft.usage,
    steps: input.draft.steps,
  });
  return doc;
}

export async function latestScore(userEmail: string): Promise<number | null> {
  await dbConnect();
  const previous = await Result.findOne({ userEmail }).sort({ createdAt: -1 }).select('score').lean();
  const score = (previous as { score?: number } | null)?.score;
  return typeof score === 'number' ? score : null;
}

export async function getOwnedResult(userEmail: string, id: string) {
  await dbConnect();
  return Result.findOne({ _id: id, userEmail }).lean();
}

export async function deleteUserAnalyses(userEmail: string) {
  await dbConnect();
  const result = await Result.deleteMany({ userEmail });
  return result.deletedCount ?? 0;
}
