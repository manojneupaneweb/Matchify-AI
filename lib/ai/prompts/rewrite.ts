import { fence, PROMPT_VERSION, UNTRUSTED_RULES } from './shared';

export const rewritePromptVersion = PROMPT_VERSION;

export function buildRewritePrompt(summary: string, missing: string[]) {
  return {
    system: `${UNTRUSTED_RULES}
Rewrite the summary so it includes the missing keywords only as skills to develop or as tools already supported by the facts. Do not invent jobs.`,
    user: `${fence('SUMMARY', summary)}\n${fence('MISSING_KEYWORDS', missing.join(', '))}`,
  };
}
