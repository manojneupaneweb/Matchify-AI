import { fence, PROMPT_VERSION, UNTRUSTED_RULES } from './shared';

export const parsePromptVersion = PROMPT_VERSION;

export function buildParsePrompt(resumeText: string) {
  return {
    system: `${UNTRUSTED_RULES}
You clean resume text. Remove page numbers, headers, and broken hyphenation.
Do not add facts that are not in the source. Keep the candidate's wording.`,
    user: fence('RESUME', resumeText),
  };
}
