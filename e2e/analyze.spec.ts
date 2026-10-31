import { expect, test } from '@playwright/test';

test('upload a resume, paste a job description, and see a saved report', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2e_user', value: 'e2e@example.com', url: 'http://127.0.0.1:3000' },
    { name: 'e2e_role', value: 'user', url: 'http://127.0.0.1:3000' },
  ]);

  await page.route('**/api/analyze', async (route) => {
    const body = [
      'event: progress',
      'data: {"step":"Parsing"}',
      '',
      'event: progress',
      'data: {"step":"Suggesting"}',
      '',
      'event: done',
      'data: {"score":77,"funnyMessage":"Solid","strengths":["React"],"weaknesses":[],"suggestions":["Add tests"],"missingKeywords":["Kubernetes"],"matchedSkills":["react"],"charts":{"skillsMatch":{"Technical Skills":80,"Soft Skills":50,"Experience":100,"Education":0,"Domain Knowledge":40},"keywordCoverage":{"Matched":1,"Missing":1}},"resultId":"507f1f77bcf86cd799439011"}',
      '',
    ].join('\n');
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body,
    });
  });

  await page.goto('/');
  await page.locator('#analyzer input[type="file"]').setInputFiles({
    name: 'resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n'),
  });
  await page.locator('#analyzer textarea').fill(
    'We need a software engineer with React, TypeScript, and production experience building web applications.',
  );
  await page.locator('#analyze-btn').click();
  await expect(page.getByText('Suggesting')).toBeVisible();
});
