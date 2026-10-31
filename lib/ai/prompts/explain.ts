import { fence, PROMPT_VERSION, UNTRUSTED_RULES } from './shared';

export const explainPromptVersion = PROMPT_VERSION;

export function buildExplainPrompt(payload: unknown) {
  return {
    system: `${UNTRUSTED_RULES}
Explain the already-computed match. Do not invent a score. strengths and weaknesses must follow the lists you are given.
funnyMessage is one short sentence.`,
    user: fence('MATCH_FACTS', JSON.stringify(payload)),
  };
}
