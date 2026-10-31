import type { ZodType } from 'zod';
import { getEnv } from '../env';
import { AppError } from '../errors';
import { logger } from '../logger';

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type GenerateResult<T> = {
  data: T;
  model: string;
  latencyMs: number;
  usage: TokenUsage;
};

type GenerateArgs<T> = {
  system: string;
  user: string;
  schema: ZodType<T>;
  responseSchema: Record<string, unknown>;
  step: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractText(payload: unknown): string {
  const text = (payload as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
    ?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new AppError('UPSTREAM', 'The model returned an empty response.', 502);
  return text;
}

function readUsage(payload: unknown): TokenUsage {
  const usage = (payload as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } })
    ?.usageMetadata;
  return {
    promptTokens: usage?.promptTokenCount ?? 0,
    completionTokens: usage?.candidatesTokenCount ?? 0,
    totalTokens: usage?.totalTokenCount ?? 0,
  };
}

export async function generateStructured<T>(args: GenerateArgs<T>): Promise<GenerateResult<T>> {
  const env = getEnv();
  const fetchImpl = args.fetchImpl ?? fetch;
  const models = [env.GEMINI_MODEL_PRIMARY, env.GEMINI_MODEL_FALLBACK];
  let prompt = args.user;
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const started = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), args.timeoutMs ?? 25_000);
      try {
        const response = await fetchImpl(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: args.system }] },
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
                responseSchema: args.responseSchema,
              },
            }),
          },
        );
        if (response.status === 429 || response.status >= 500) {
          lastError = new AppError('UPSTREAM', `Model ${model} returned ${response.status}.`, 502);
          if (attempt < 2) {
            await sleep(200 * 2 ** attempt);
            continue;
          }
          break;
        }
        if (!response.ok) {
          throw new AppError('UPSTREAM', 'The model request failed.', 502);
        }
        const payload = await response.json();
        const text = extractText(payload);
        let json: unknown;
        try {
          json = JSON.parse(text);
        } catch {
          lastError = new AppError('UPSTREAM', 'The model returned invalid JSON.', 502);
          if (attempt < 2) {
            prompt = `${args.user}\n\nYour previous reply was not valid JSON. Reply with JSON only. Error: invalid JSON.`;
            continue;
          }
          break;
        }
        const parsed = args.schema.safeParse(json);
        if (!parsed.success) {
          const issue = parsed.error.issues.map((item) => item.message).join('; ');
          lastError = new AppError('UPSTREAM', 'The model returned an unexpected shape.', 502);
          if (attempt < 2) {
            prompt = `${args.user}\n\nYour previous JSON failed validation: ${issue}. Return corrected JSON only.`;
            continue;
          }
          break;
        }
        const usage = readUsage(payload);
        const latencyMs = Date.now() - started;
        logger.info('model step', { step: args.step, model, latencyMs, ...usage });
        return { data: parsed.data, model, latencyMs, usage };
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new AppError('TIMEOUT', 'The model request timed out.', 504);
          break;
        }
        lastError = error;
        if (attempt < 2 && !(error instanceof AppError && error.code === 'UPSTREAM')) {
          await sleep(200 * 2 ** attempt);
          continue;
        }
        if (attempt < 2 && error instanceof AppError) {
          await sleep(200 * 2 ** attempt);
          continue;
        }
        break;
      } finally {
        clearTimeout(timer);
      }
    }
  }

  if (lastError instanceof AppError) throw lastError;
  throw new AppError('UPSTREAM', 'Analysis could not be completed.', 502);
}
