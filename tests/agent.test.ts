import { describe, expect, it } from 'vitest';
import { extractKeywords, rewriteBullet } from '../lib/agent/tools';
import { agentTurn } from '../lib/agent/loop';
import { runAgent } from '../lib/agent/run';
import { z } from 'zod';
import { resetEnvCache } from '../lib/env';

process.env.GEMINI_API_KEY = 'test-key';
process.env.GEMINI_MODEL_PRIMARY = 'primary-model';
process.env.GEMINI_MODEL_FALLBACK = 'fallback-model';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/matchify';
process.env.NEXTAUTH_SECRET = 'nextauth-secret';
process.env.JWT_SECRET = 'jwt-secret';
resetEnvCache();

const schema = z.object({ skills: z.array(z.string()) });

function body(text: string) {
  return {
    candidates: [{ content: { parts: [{ text }] } }],
    usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
  };
}

describe('tools', () => {
  it('drops stopwords and rewrites a bullet with missing keywords', () => {
    expect(extractKeywords('React and react for the team')).toContain('react');
    expect(rewriteBullet('Built a web app.', ['react'])).toMatch(/react/);
  });
});

describe('agent retry', () => {
  it('runs a tool call, then retries once when JSON is invalid', async () => {
    let n = 0;
    const fetchImpl = async (_url: string, init: RequestInit) => {
      n += 1;
      const contents = JSON.parse(String(init.body)).contents as { parts: { text?: string; functionResponse?: unknown }[] }[];
      const last = contents[contents.length - 1];
      if (last.parts.some((part) => part.functionResponse)) {
        const prompt = contents[0].parts[0].text || '';
        if (!prompt.includes('failed')) return new Response(JSON.stringify(body('not-json')));
        return new Response(JSON.stringify(body('{"skills":["react"]}')));
      }
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ functionCall: { name: 'extract_keywords', args: { text: 'react apps' } } }] } }],
        usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
      }));
    };
    const result = await agentTurn({
      system: 'return json',
      user: 'read this',
      schema,
      step: 'test',
      fetchImpl: fetchImpl as typeof fetch,
    });
    expect(result.data.skills).toEqual(['react']);
    expect(result.toolCalls).toContain('extract_keywords');
    expect(n).toBeGreaterThan(2);
  });
});

describe('critique retry', () => {
  it('asks for a second critique when the first one is not ok', async () => {
    const steps: string[] = [];
    const fetchImpl = async (_url: string, init: RequestInit) => {
      const system = JSON.parse(String(init.body)).systemInstruction.parts[0].text as string;
      let text = '{"suggestions":[],"rewrites":[],"summary":"kept"}';
      if (system.includes('Extract a resume')) {
        text = '{"skills":["react"],"experience":[{"title":"dev","years":2}],"education":[],"summary":"builds ui"}';
      } else if (system.includes('job requirements')) {
        text = '{"mustHaveSkills":["react"],"niceToHaveSkills":[],"keywords":["react"],"experienceLevel":"mid","domain":"web"}';
      } else if (system.includes('last critique failed')) {
        steps.push('retry');
        text = '{"ok":true,"issues":[],"funnyMessage":"Solid.","strengths":["react"],"weaknesses":[]}';
      } else if (system.includes('Review this match')) {
        steps.push('first');
        text = '{"ok":false,"issues":["skill list disagrees"],"funnyMessage":"Off.","strengths":[],"weaknesses":["gap"]}';
      }
      return new Response(JSON.stringify(body(text)));
    };

    const draft = await runAgent({
      resumeText: 'Built React interfaces for two years.',
      jobDescription: 'Need a react developer for web work.',
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(steps).toEqual(['first', 'retry']);
    expect(draft.funnyMessage).toBe('Solid.');
    expect(draft.critiqueIssues).toEqual([]);
  });
});
