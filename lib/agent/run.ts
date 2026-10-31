import { z } from 'zod';
import { agentTurn } from './loop';
import { fence, UNTRUSTED_RULES } from '../ai/prompts/shared';
import type { AnalysisDraft } from '../ai/pipeline';
import type { TokenUsage } from '../ai/gemini';
import { experienceAligned, scoreMatch } from '../scoring';
import { logger } from '../logger';

const profileSchema = z.object({
  skills: z.array(z.string()).default([]),
  experience: z.array(z.object({ title: z.string().default(''), years: z.number().default(0) })).default([]),
  education: z.array(z.string()).default([]),
  summary: z.string().default(''),
});

const jobSchema = z.object({
  mustHaveSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  experienceLevel: z.string().default('unknown'),
  domain: z.string().default(''),
});

const critiqueSchema = z.object({
  ok: z.boolean(),
  issues: z.array(z.string()).default([]),
  funnyMessage: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
});

const rewriteSchema = z.object({
  suggestions: z.array(z.string()).default([]),
  rewrites: z.array(z.object({
    before: z.string(),
    after: z.string(),
    reason: z.string().default(''),
  })).default([]),
  summary: z.string().default(''),
});

function blankUsage(): TokenUsage {
  return { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
}

export async function runAgent(input: {
  resumeText: string;
  jobDescription: string;
  previousScore?: number | null;
  onProgress?: (step: string) => void;
  fetchImpl?: typeof fetch;
}): Promise<AnalysisDraft & { previousScore: number | null; scoreDelta: number | null; critiqueIssues: string[] }> {
  const usage = blankUsage();
  const steps: AnalysisDraft['steps'] = [];
  const progress = (step: string) => input.onProgress?.(step);

  progress('Parsing');
  const profile = await agentTurn({
    step: 'parse',
    fetchImpl: input.fetchImpl,
    schema: profileSchema,
    system: `${UNTRUSTED_RULES}
Extract a resume profile as JSON with skills, experience [{title, years}], education, summary.
Call extract_keywords on the resume before you answer. Do not invent employers.`,
    user: fence('RESUME', input.resumeText),
  });
  usage.promptTokens += profile.usage.promptTokens;
  usage.completionTokens += profile.usage.completionTokens;
  usage.totalTokens += profile.usage.totalTokens;
  steps.push({ name: 'Parsing', model: profile.model, latencyMs: 0, promptTokens: profile.usage.promptTokens, completionTokens: profile.usage.completionTokens });

  progress('Extracting');
  const job = await agentTurn({
    step: 'analyze',
    fetchImpl: input.fetchImpl,
    schema: jobSchema,
    system: `${UNTRUSTED_RULES}
Extract job requirements as JSON: mustHaveSkills, niceToHaveSkills, keywords, experienceLevel, domain.
Call extract_keywords on the job description first.`,
    user: fence('JOB_DESCRIPTION', input.jobDescription),
  });
  usage.promptTokens += job.usage.promptTokens;
  usage.completionTokens += job.usage.completionTokens;
  usage.totalTokens += job.usage.totalTokens;

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
  let critique = await agentTurn({
    step: 'critique',
    fetchImpl: input.fetchImpl,
    schema: critiqueSchema,
    system: `${UNTRUSTED_RULES}
Review this match. Return JSON: ok, issues, funnyMessage, strengths, weaknesses.
If the skill lists contradict the score notes, set ok to false and say why. Do not invent a new score.`,
    user: fence('MATCH', JSON.stringify(scored)),
  });

  if (!critique.data.ok) {
    critique = await agentTurn({
      step: 'critique-retry',
      fetchImpl: input.fetchImpl,
      schema: critiqueSchema,
      system: `${UNTRUSTED_RULES}
Your last critique failed its own check. Return a tighter JSON review. Do not change the numeric score.`,
      user: fence('ISSUES', (critique.data.issues || []).join('\n') || 'inconsistent'),
    });
  }
  usage.promptTokens += critique.usage.promptTokens;
  usage.completionTokens += critique.usage.completionTokens;
  usage.totalTokens += critique.usage.totalTokens;
  steps.push({ name: 'Scoring', model: critique.model, latencyMs: 0, promptTokens: critique.usage.promptTokens, completionTokens: critique.usage.completionTokens });

  progress('Suggesting');
  const rewrite = await agentTurn({
    step: 'rewrite',
    fetchImpl: input.fetchImpl,
    schema: rewriteSchema,
    system: `${UNTRUSTED_RULES}
Suggest resume edits. Call rewrite_bullet for at least one weak bullet if keywords are missing.
Return JSON: suggestions, rewrites [{before, after, reason}], summary.`,
    user: fence('GAPS', JSON.stringify({
      missing: scored.missingSkills,
      issues: critique.data.issues || [],
      summary: profile.data.summary || '',
    })),
  });
  usage.promptTokens += rewrite.usage.promptTokens;
  usage.completionTokens += rewrite.usage.completionTokens;
  usage.totalTokens += rewrite.usage.totalTokens;
  steps.push({ name: 'Suggesting', model: rewrite.model, latencyMs: 0, promptTokens: rewrite.usage.promptTokens, completionTokens: rewrite.usage.completionTokens });

  const gained = scored.missingKeywords.filter((keyword) =>
    (rewrite.data.summary || '').toLowerCase().includes(keyword.toLowerCase()),
  );
  const improved = scoreMatch({
    mustHave: job.data.mustHaveSkills || [],
    niceToHave: job.data.niceToHaveSkills || [],
    resumeSkills: [...(profile.data.skills || []), ...gained],
    jdKeywords: job.data.keywords || [],
    experienceAligned: aligned,
  });

  const previousScore = input.previousScore ?? null;
  const scoreDelta = previousScore == null ? null : scored.score - previousScore;
  logger.info('agent finished', { score: scored.score, scoreDelta, tools: [...profile.toolCalls, ...job.toolCalls, ...rewrite.toolCalls] });

  const memoryNote = scoreDelta == null
    ? ''
    : scoreDelta === 0
      ? ' Same score as your last run.'
      : ` ${scoreDelta > 0 ? 'Up' : 'Down'} ${Math.abs(scoreDelta)} points from your last run.`;

  return {
    score: scored.score,
    improvedScore: improved.score,
    funnyMessage: `${critique.data.funnyMessage || ''}${memoryNote}`.trim(),
    strengths: critique.data.strengths || [],
    weaknesses: critique.data.weaknesses || [],
    suggestions: rewrite.data.suggestions || [],
    missingKeywords: scored.missingKeywords,
    matchedSkills: scored.matchedSkills,
    missingSkills: scored.missingSkills,
    rewrites: (rewrite.data.rewrites || []).map((item) => ({
      before: item.before,
      after: item.after,
      reason: item.reason || '',
    })),
    rewrittenSummary: rewrite.data.summary || '',
    charts: {
      skillsMatch: {
        'Technical Skills': scored.breakdown.mustHave,
        'Soft Skills': scored.breakdown.niceToHave,
        Experience: scored.breakdown.experience,
        Education: (profile.data.education || []).length ? 100 : 0,
        'Domain Knowledge': job.data.domain ? 40 : 0,
      },
      keywordCoverage: { Matched: scored.matchedKeywords.length, Missing: scored.missingKeywords.length },
    },
    usage,
    steps,
    model: profile.model,
    requirements: {
      mustHaveSkills: job.data.mustHaveSkills || [],
      niceToHaveSkills: job.data.niceToHaveSkills || [],
      keywords: job.data.keywords || [],
      experienceLevel: job.data.experienceLevel || 'unknown',
      domain: job.data.domain || '',
    },
    profile: {
      skills: profile.data.skills || [],
      experience: (profile.data.experience || []).map((item) => ({ title: item.title || '', years: item.years || 0 })),
      education: profile.data.education || [],
      summary: profile.data.summary || '',
    },
    previousScore,
    scoreDelta,
    critiqueIssues: critique.data.issues || [],
  };
}
