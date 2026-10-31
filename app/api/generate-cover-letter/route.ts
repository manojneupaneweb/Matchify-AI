import pdf from 'pdf-parse/lib/pdf-parse.js';
import { ZodError } from 'zod';
import { errorResponse } from '@/lib/http';
import { AppError } from '@/lib/errors';
import { clientIp, enforceWriteRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/services/session';
import { writeCoverLetter } from '@/lib/services/writing';
import { jobDescriptionSchema } from '@/lib/validation/schemas';
import { assertPageCount, assertPdf, assertResumeText } from '@/lib/validation/pdf';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await enforceWriteRateLimit(user.email, clientIp(req));
    const formData = await req.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription');
    if (!(file instanceof File) || typeof jobDescription !== 'string') {
      throw new AppError('VALIDATION', 'A PDF resume and a job description are required.', 400);
    }
    const jd = jobDescriptionSchema.parse(jobDescription);
    const buffer = Buffer.from(await file.arrayBuffer());
    assertPdf(buffer);
    const parsed = await pdf(buffer);
    assertPageCount(Number(parsed.numpages));
    const resumeText = assertResumeText(parsed.text || '');
    const letter = await writeCoverLetter(resumeText, jd);
    return Response.json(letter);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(new AppError('VALIDATION', 'The job description is too short.', 400));
    }
    if (!(error instanceof AppError) && error instanceof Error && error.message.includes('PDF')) {
      return errorResponse(new AppError('INVALID_FILE', 'Could not read this PDF.', 400));
    }
    return errorResponse(error);
  }
}
