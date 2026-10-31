import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { runAgent } from '../lib/agent/run';

type Expectation = {
  id: string;
  resume: string;
  job: string;
  scoreMin: number;
  scoreMax: number;
  missingIncludes: string[];
};

type Row = {
  id: string;
  score: number;
  scoreOk: boolean;
  missingOk: boolean;
  schemaOk: boolean;
  latencyMs: number;
};

const dir = path.join(process.cwd(), 'eval-data');

async function once(sample: Expectation): Promise<Row> {
  const started = Date.now();
  try {
    const draft = await runAgent({
      resumeText: sample.resume,
      jobDescription: sample.job,
    });
    const missing = draft.missingSkills.map((skill) => skill.toLowerCase());
    return {
      id: sample.id,
      score: draft.score,
      scoreOk: draft.score >= sample.scoreMin && draft.score <= sample.scoreMax,
      missingOk: sample.missingIncludes.every((skill) => missing.includes(skill.toLowerCase())),
      schemaOk: true,
      latencyMs: Date.now() - started,
    };
  } catch {
    return { id: sample.id, score: 0, scoreOk: false, missingOk: false, schemaOk: false, latencyMs: Date.now() - started };
  }
}

async function main() {
  const files = readdirSync(dir).filter((name) => name.endsWith('.json'));
  const samples = files.map((file) => JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Expectation);
  const runs: Row[][] = [];
  for (let run = 1; run <= 3; run += 1) {
    const results: Row[] = [];
    for (const sample of samples) results.push(await once(sample));
    runs.push(results);
    console.log(`run ${run}`, results.map((item) => `${item.id}:${item.schemaOk ? item.score : 'fail'}`).join(' '));
  }

  const flat = runs.flat();
  const schemaRate = flat.filter((row) => row.schemaOk).length / flat.length;
  const avgLatency = Math.round(flat.reduce((sum, row) => sum + row.latencyMs, 0) / flat.length);
  console.log(`schema pass rate ${(schemaRate * 100).toFixed(0)}%`);
  console.log(`mean latency ${avgLatency}ms`);

  for (const sample of samples) {
    const scores = runs.map((run) => run.find((item) => item.id === sample.id)?.score ?? 0);
    const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    const variance = scores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / scores.length;
    const valid = runs.flat().filter((item) => item.id === sample.id && item.schemaOk && item.scoreOk && item.missingOk).length;
    console.log(`${sample.id} scores=${scores.join(',')} variance=${variance.toFixed(2)} in-range=${valid}/3`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
