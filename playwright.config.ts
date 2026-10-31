import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    env: {
      ...process.env,
      E2E_AUTH_BYPASS: '1',
      NODE_ENV: 'development',
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/matchify',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'e2e-key',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'e2e-nextauth-secret',
      JWT_SECRET: process.env.JWT_SECRET || 'e2e-jwt-secret',
      NEXTAUTH_URL: 'http://127.0.0.1:3000',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
