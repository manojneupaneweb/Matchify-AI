import { generateStructured, type TokenUsage } from './gemini';
import {
  cleanedResumeSchema,
  explanationSchema,
  jobRequirementsSchema,
  resumeProfileSchema,
  rewriteSchema,
  suggestionsSchema,
  type JobRequirements,
  type ResumeProfile,
} from './schemas';
import { buildExplainPrompt } from './prompts/explain';
import { buildJobPrompt } from './prompts/job';
import { buildParsePrompt } from './prompts/parse';
import { buildResumePrompt } from './prompts/resume';
import { buildRewritePrompt } from './prompts/rewrite';
import { buildSuggestPrompt } from './prompts/suggest';
import { experienceAligned, scoreMatch, type ScoreResult } from '../scoring';
import { logger } from '../logger';

const objectSchema = {
  type: 'OBJECT',
  properties: {
    text: { type: 'STRING' },
    warnings: { type: 'ARRAY', items: { type: 'STRING' } },
    mustHaveSkills: { type: 'ARRAY', items: { type: 'STRING' } },
    niceToHaveSkills: { type: 'ARRAY', items: { type: 'STRING' } },
    keywords: { type: 'ARRAY', items: { type: 'STRING' } },
    experienceLevel: { type: 'STRING' },
    domain: { type: 'STRING' },
    skills: { type: 'ARRAY', items: { type: 'STRING' } },
    experience: { type: 'ARRAY', items: { type: 'OBJECT' } },
    education: { type: 'ARRAY', items: { type: 'STRING' } },
    summary: { type: 'STRING' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
    funnyMessage: { type: 'STRING' },
    suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
    rewrites: { type: 'ARRAY', items: { type: 'OBJECT' } },
  },
};

export type StepLog = {
  name: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
};

export type AnalysisDraft = {
  score: number;
  improvedScore: number;
  funnyMessage: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  rewrites: { before: string; after: string; reason: string }[];
  rewrittenSummary: string;
  charts: {
    skillsMatch: Record<string, number>;
    keywordCoverage: { Matched: number; Missing: number };
  };
  usage: TokenUsage;
  steps: StepLog[];
  model: string;
  requirements: JobRequirements;
  profile: ResumeProfile;
};

function addUsage(total: TokenUsage, next: TokenUsage) {
  total.promptTokens += next.promptTokens;
  total.completionTokens += next.completionTokens;
  total.totalTokens += next.totalTokens;
}

function chartsFor(score: ScoreResult, profile: ResumeProfile, domain: string) {
  const domainHit =
    domain &&
    (profile.skills || []).some((skill) => skill.toLowerCase().includes(domain.toLowerCase()))
      ? 100
      : domain
        ? 40
        : 0;
  return {
    skillsMatch: {
      'Technical Skills': score.breakdown.mustHave,
      'Soft Skills': score.breakdown.niceToHave,
      Experience: score.breakdown.experience,
      Education: (profile.education || []).length > 0 ? 100 : 0,
      'Domain Knowledge': domainHit,
    },
    keywordCoverage: {
      Matched: score.matchedKeywords.length,
      Missing: score.missingKeywords.length,
    },
  };
}

export async function runAnalysisPipeline(input: {
  resumeText: string;
  jobDescription: string;
  onProgress?: (step: string) => void;
  fetchImpl?: typeof fetch;
}): Promise<AnalysisDraft> {
  const usage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const steps: StepLog[] = [];
  const progress = (step: string) => input.onProgress?.(step);

  progress('Parsing');
  const parsePrompt = buildParsePrompt(input.resumeText);
  const cleaned = await generateStructured({
    ...parsePrompt,
    schema: cleanedResumeSchema,
    responseSchema: objectSchema,
    step: 'parse',
    fetchImpl: input.fetchImpl,
  });
  addUsage(usage, cleaned.usage);
  steps.push({ name: 'Parsing', model: cleaned.model, latencyMs: cleaned.latencyMs, promptTokens: cleaned.usage.promptTokens, completionTokens: cleaned.usage.completionTokens });

  progress('Extracting');
  const jobPrompt = buildJobPrompt(input.jobDescription);
  const resumePrompt = buildResumePrompt(cleaned.data.text);
  const [job, profile] = await Promise.all([
    generateStructured({
      ...jobPrompt,
      schema: jobRequirementsSchema,
      responseSchema: objectSchema,
      step: 'job',
      fetchImpl: input.fetchImpl,
    }),
    generateStructured({
      ...resumePrompt,
      schema: resumeProfileSchema,
      responseSchema: objectSchema,
      step: 'resume',
      fetchImpl: input.fetchImpl,
    }),
  ]);
  addUsage(usage, job.usage);
  addUsage(usage, profile.usage);
  steps.push({ name: 'Extracting', model: job.model, latencyMs: job.latencyMs + profile.latencyMs, promptTokens: job.usage.promptTokens + profile.usage.promptTokens, completionTokens: job.usage.completionTokens + profile.usage.completionTokens });

  progress('Matching');
  const aligned = experienceAligned(
    job.data.experienceLevel || 'unknown',
    (profile.data.experience || []).map((item) => item.years || 0),
  );
  const scored = scoreMatch({
    mustHave: job.data.mustHaveSkills || [],
    niceToHave: job.data.niceToHaveSkills || [],
    resumeSkills: profile.data.skills || [],
    jdKeywords: job.data.keywords || [],
    experienceAligned: aligned,
  });

  progress('Scoring');
  const explainPrompt = buildExplainPrompt({
    score: scored.score,
    matchedSkills: scored.matchedSkills,
    missingSkills: scored.missingSkills,
    domain: job.data.domain,
  });
  const explained = await generateStructured({
    ...explainPrompt,
    schema: explanationSchema,
    responseSchema: objectSchema,
    step: 'explain',
    fetchImpl: input.fetchImpl,
  });
  addUsage(usage, explained.usage);
  steps.push({ name: 'Scoring', model: explained.model, latencyMs: explained.latencyMs, promptTokens: explained.usage.promptTokens, completionTokens: explained.usage.completionTokens });

  progress('Suggesting');
  const suggestPrompt = buildSuggestPrompt({
    missingSkills: scored.missingSkills,
    missingKeywords: scored.missingKeywords,
    summary: profile.data.summary,
  });
  const suggestions = await generateStructured({
    ...suggestPrompt,
    schema: suggestionsSchema,
    responseSchema: objectSchema,
    step: 'suggest',
    fetchImpl: input.fetchImpl,
  });
  addUsage(usage, suggestions.usage);

  const rewritePrompt = buildRewritePrompt(profile.data.summary || cleaned.data.text.slice(0, 600), scored.missingKeywords);
  const rewritten = await generateStructured({
    ...rewritePrompt,
    schema: rewriteSchema,
    responseSchema: objectSchema,
    step: 'rewrite',
    fetchImpl: input.fetchImpl,
  });
  addUsage(usage, rewritten.usage);
  steps.push({
    name: 'Suggesting',
    model: suggestions.model,
    latencyMs: suggestions.latencyMs + rewritten.latencyMs,
    promptTokens: suggestions.usage.promptTokens + rewritten.usage.promptTokens,
    completionTokens: suggestions.usage.completionTokens + rewritten.usage.completionTokens,
  });

  const gained = scored.missingKeywords.filter((keyword) =>
    (rewritten.data.summary || '').toLowerCase().includes(keyword.toLowerCase()),
  );
  const improved = scoreMatch({
    mustHave: job.data.mustHaveSkills || [],
    niceToHave: job.data.niceToHaveSkills || [],
    resumeSkills: [...(profile.data.skills || []), ...gained],
    jdKeywords: job.data.keywords || [],
    experienceAligned: aligned,
  });

  logger.info('analysis pipeline complete', {
    score: scored.score,
    improvedScore: improved.score,
    totalTokens: usage.totalTokens,
  });

  return {
    score: scored.score,
    improvedScore: improved.score,
    funnyMessage: explained.data.funnyMessage || '',
    strengths: explained.data.strengths || [],
    weaknesses: explained.data.weaknesses || [],
    suggestions: suggestions.data.suggestions || [],
    missingKeywords: scored.missingKeywords,
    matchedSkills: scored.matchedSkills,
    missingSkills: scored.missingSkills,
    rewrites: (suggestions.data.rewrites || []).map((item) => ({
      before: item.before,
      after: item.after,
      reason: item.reason || '',
    })),
    rewrittenSummary: rewritten.data.summary || '',
    charts: chartsFor(scored, profile.data as ResumeProfile, job.data.domain || ''),
    usage,
    steps,
    model: cleaned.model,
    requirements: job.data as JobRequirements,
    profile: profile.data as ResumeProfile,
  };
}
