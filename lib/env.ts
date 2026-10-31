import { z } from 'zod';

const schema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL_PRIMARY: z.string().min(1).default('gemini-2.5-flash'),
  GEMINI_MODEL_FALLBACK: z.string().min(1).default('gemini-2.0-flash'),
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_URL: z.string().min(1).default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GITHUB_ID: z.string().optional().default(''),
  GITHUB_SECRET: z.string().optional().default(''),
  ADMIN_EMAIL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(''),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(''),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  E2E_AUTH_BYPASS: z.string().optional().default(''),
  NODE_ENV: z.string().optional().default('development'),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => issue.path.join('.') || 'env').join(', ');
    throw new Error(`Invalid environment: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}

export function resetEnvCache() {
  cached = null;
}

export function assertEnv() {
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  getEnv();
}
