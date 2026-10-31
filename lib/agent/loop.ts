import type { ZodType } from 'zod';
import { getEnv } from '../env';
import { AppError } from '../errors';
import { logger } from '../logger';
import type { TokenUsage } from '../ai/gemini';
import { runTool, toolDeclarations } from './tools';

type Part = {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: unknown };
};

type Content = { role: 'user' | 'model'; parts: Part[] };

export type AgentTurn<T> = {
  data: T;
  model: string;
  usage: TokenUsage;
  toolCalls: string[];
};

function usageOf(payload: unknown): TokenUsage {
  const usage = (payload as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } })
    ?.usageMetadata;
  return {
    promptTokens: usage?.promptTokenCount ?? 0,
    completionTokens: usage?.candidatesTokenCount ?? 0,
    totalTokens: usage?.totalTokenCount ?? 0,
  };
}

function add(total: TokenUsage, next: TokenUsage) {
  total.promptTokens += next.promptTokens;
  total.completionTokens += next.completionTokens;
  total.totalTokens += next.totalTokens;
}

async function post(
  model: string,
  contents: Content[],
  system: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
) {
  const env = getEnv();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          tools: [{ functionDeclarations: toolDeclarations }],
          generationConfig: { temperature: 0.2 },
        }),
      },
    );
    if (response.status === 429 || response.status >= 500) {
      throw new AppError('UPSTREAM', `Model ${model} returned ${response.status}.`, 502);
    }
    if (!response.ok) throw new AppError('UPSTREAM', 'The model request failed.', 502);
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('TIMEOUT', 'The model request timed out.', 504);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function agentTurn<T>(args: {
  system: string;
  user: string;
  schema: ZodType<T>;
  step: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<AgentTurn<T>> {
  const env = getEnv();
  const fetchImpl = args.fetchImpl ?? fetch;
  const models = [env.GEMINI_MODEL_PRIMARY, env.GEMINI_MODEL_FALLBACK];
  let feedback = args.user;
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const contents: Content[] = [{ role: 'user', parts: [{ text: feedback }] }];
      const total: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const toolCalls: string[] = [];
      try {
        for (let round = 0; round < 4; round += 1) {
          const payload = await post(model, contents, args.system, fetchImpl, args.timeoutMs ?? 25_000);
          add(total, usageOf(payload));
          const parts: Part[] = payload?.candidates?.[0]?.content?.parts || [];
          const calls = parts.filter((part) => part.functionCall?.name);
          if (calls.length > 0) {
            contents.push({ role: 'model', parts: calls });
            const responses: Part[] = calls.map((part) => {
              const name = part.functionCall!.name;
              toolCalls.push(name);
              return {
                functionResponse: {
                  name,
                  response: runTool(name, part.functionCall?.args || {}),
                },
              };
            });
            contents.push({ role: 'user', parts: responses });
            continue;
          }
          const text = parts.map((part) => part.text || '').join('').trim();
          let json: unknown;
          try {
            json = JSON.parse(text.replace(/```json|```/gi, ''));
          } catch {
            throw new AppError('UPSTREAM', 'Gemini sent invalid JSON.', 502);
          }
          const parsed = args.schema.safeParse(json);
          if (!parsed.success) {
            const issue = parsed.error.issues.map((item) => item.message).join('; ');
            throw new AppError('UPSTREAM', issue || 'Schema check failed.', 502);
          }
          logger.info('agent step', { step: args.step, model, tools: toolCalls.join(',') || 'none' });
          return { data: parsed.data, model, usage: total, toolCalls };
        }
        throw new AppError('UPSTREAM', 'The agent kept calling tools and never finished.', 502);
      } catch (error) {
        lastError = error;
        if (error instanceof AppError && error.code === 'TIMEOUT') break;
        if (attempt < 2 && error instanceof AppError) {
          feedback = `${args.user}\n\nYour last reply failed: ${error.message}. Return corrected JSON only.`;
          continue;
        }
        break;
      }
    }
  }
  if (lastError instanceof AppError) throw lastError;
  throw new AppError('UPSTREAM', 'Analysis could not be completed.', 502);
}
