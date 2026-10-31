import pdf from 'pdf-parse/lib/pdf-parse.js';
import { errorResponse } from '@/lib/http';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { requireUser } from '@/lib/services/session';
import { latestScore, saveAnalysis } from '@/lib/services/analysis';
import { runAgent } from '@/lib/agent/run';
import { analysisKey, readAnalysisCache, withPrevious, writeAnalysisCache } from '@/lib/agent/cache';
import { assertPageCount, assertPdf, assertResumeText } from '@/lib/validation/pdf';
import { jobDescriptionSchema } from '@/lib/validation/schemas';
import { clientIp, enforceAnalyzeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const ip = clientIp(req);
    await enforceAnalyzeRateLimit(user.email, ip);

    const formData = await req.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription');
    if (!(file instanceof File) || typeof jobDescription !== 'string') {
      throw new AppError('VALIDATION', 'A PDF resume and a job description are required.', 400);
    }
    const jd = jobDescriptionSchema.parse(jobDescription);
    const buffer = Buffer.from(await file.arrayBuffer());
    assertPdf(buffer);

    let resumeText = '';
    try {
      const parsed = await pdf(buffer);
      assertPageCount(Number(parsed.numpages));
      resumeText = assertResumeText(parsed.text || '');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('INVALID_FILE', 'The PDF could not be read.', 400);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };
        try {
          const previousScore = await latestScore(user.email);
          const key = analysisKey(resumeText, jd);
          const cached = await readAnalysisCache(key);
          let base = cached;
          if (base) {
            logger.info('analysis cache hit', { key: key.slice(0, 12) });
            for (const step of ['Parsing', 'Extracting', 'Matching', 'Scoring', 'Suggesting']) {
              send('progress', { step });
            }
          } else {
            base = await runAgent({
              resumeText,
              jobDescription: jd,
              onProgress: (step) => send('progress', { step }),
            });
            await writeAnalysisCache(key, base);
          }
          const draft = withPrevious(base, previousScore);
          const saved = await saveAnalysis({
            userEmail: user.email,
            resumeName: file.name || 'Resume.pdf',
            jobDescription: jd,
            draft,
          });
          send('done', {
            score: draft.score,
            previousScore: draft.previousScore,
            scoreDelta: draft.scoreDelta,
            improvedScore: draft.improvedScore,
            funnyMessage: draft.funnyMessage,
            strengths: draft.strengths,
            weaknesses: draft.weaknesses,
            suggestions: draft.suggestions,
            missingKeywords: draft.missingKeywords,
            matchedSkills: draft.matchedSkills,
            missingSkills: draft.missingSkills,
            rewrites: draft.rewrites,
            rewrittenSummary: draft.rewrittenSummary,
            charts: draft.charts,
            resultId: String(saved._id),
          });
        } catch (error) {
          logger.error('analysis stream failed', {
            message: error instanceof Error ? error.message : 'unknown',
          });
          const body =
            error instanceof AppError
              ? { code: error.code, message: error.message }
              : { code: 'INTERNAL', message: 'Analysis failed. Please try again.' };
          send('error', { error: body });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(new AppError('VALIDATION', 'Check the job description and try again.', 400));
    }
    return errorResponse(error);
  }
}
