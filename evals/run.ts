/**
 * Manual evaluation. Uses the real Gemini API. Not part of CI.
 * Usage: npm run eval
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { runAnalysisPipeline } from '../lib/ai/pipeline';

type Expectation = {
  id: string;
  resume: string;
  job: string;
  scoreMin: number;
  scoreMax: number;
  missingIncludes: string[];
};

const dir = path.join(process.cwd(), 'evals', 'cases');
const files = readdirSync(dir).filter((name) => name.endsWith('.json'));

async function once(sample: Expectation) {
  const draft = await runAnalysisPipeline({
    resumeText: sample.resume,
    jobDescription: sample.job,
  });
  const missing = draft.missingSkills.map((skill) => skill.toLowerCase());
  const missingOk = sample.missingIncludes.every((skill) => missing.includes(skill.toLowerCase()));
  const scoreOk = draft.score >= sample.scoreMin && draft.score <= sample.scoreMax;
  return { id: sample.id, score: draft.score, scoreOk, missingOk, missing };
}

async function main() {
  const samples = files.map((file) => JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Expectation);
  const runs = [];
  for (let run = 1; run <= 3; run += 1) {
    const results = [];
    for (const sample of samples) {
      results.push(await once(sample));
    }
    runs.push(results);
    console.log(`run ${run}`, results.map((item) => `${item.id}:${item.score}`).join(' '));
  }
  for (const sample of samples) {
    const scores = runs.map((run) => run.find((item) => item.id === sample.id)?.score ?? 0);
    const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    const variance = scores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / scores.length;
    const valid = runs.flat().filter((item) => item.id === sample.id && item.scoreOk && item.missingOk).length;
    console.log(
      `${sample.id} scores=${scores.join(',')} variance=${variance.toFixed(2)} schema-valid-and-in-range=${valid}/3`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
