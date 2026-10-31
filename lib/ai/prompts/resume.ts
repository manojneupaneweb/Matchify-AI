import { fence, PROMPT_VERSION, UNTRUSTED_RULES } from './shared';

export const resumePromptVersion = PROMPT_VERSION;

export function buildResumePrompt(resumeText: string) {
  return {
    system: `${UNTRUSTED_RULES}
Extract a profile. skills are concrete tools and practices the candidate claims.
years is a number of years for that role, or 0 if unknown. Do not invent employers or degrees.`,
    user: fence('RESUME', resumeText),
  };
}
