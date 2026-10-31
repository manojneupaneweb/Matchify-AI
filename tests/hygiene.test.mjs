import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('.env.example is not gitignored and lists required variables', () => {
  const ignore = readFileSync('.gitignore', 'utf8');
  assert.match(ignore, /!\.env\.example/);
  const example = readFileSync('.env.example', 'utf8');
  for (const key of ['GEMINI_API_KEY', 'MONGODB_URI', 'NEXTAUTH_SECRET', 'JWT_SECRET']) {
    assert.match(example, new RegExp(`^${key}=`, 'm'));
  }
});

test('JWT helper does not embed a fallback secret', () => {
  const src = readFileSync('lib/auth.ts', 'utf8');
  assert.equal(src.includes('super-secret-jwt-key-fallback'), false);
});
