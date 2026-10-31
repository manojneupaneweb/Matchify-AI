import { fence, PROMPT_VERSION, UNTRUSTED_RULES } from './shared';

export const suggestPromptVersion = PROMPT_VERSION;

export function buildSuggestPrompt(payload: unknown) {
  return {
    system: `${UNTRUSTED_RULES}
Write specific resume edits. Each rewrite has a before bullet taken from the resume and an after bullet that adds only missing keywords the candidate could truthfully claim as exposure, not fake employers.
If you cannot improve a bullet honestly, say so in the suggestion and leave rewrites empty.`,
    user: fence('MATCH_FACTS', JSON.stringify(payload)),
  };
}
