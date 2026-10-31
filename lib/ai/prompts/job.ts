import { fence, PROMPT_VERSION, UNTRUSTED_RULES } from './shared';

export const jobPromptVersion = PROMPT_VERSION;

export function buildJobPrompt(jobDescription: string) {
  return {
    system: `${UNTRUSTED_RULES}
Extract hiring requirements. mustHaveSkills are explicit requirements.
niceToHaveSkills are preferred or bonus skills. keywords are short ATS terms.
experienceLevel is one of junior, mid, senior, lead, or unknown. Do not invent tools that are not mentioned.`,
    user: fence('JOB_DESCRIPTION', jobDescription),
  };
}
