import { ZodError } from 'zod';
import { errorResponse } from '@/lib/http';
import { AppError } from '@/lib/errors';
import { clientIp, enforceWriteRateLimit } from '@/lib/rate-limit';
import { requireUser } from '@/lib/services/session';
import { writeJobDescription } from '@/lib/services/writing';
import { jdIdeaSchema } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    await enforceWriteRateLimit(user.email, clientIp(req));
    const parsed = jdIdeaSchema.parse(await req.json());
    const posting = await writeJobDescription(parsed.idea, parsed.tone || 'professional');
    return Response.json(posting);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(new AppError('VALIDATION', 'Give a bit more detail about the role.', 400));
    }
    return errorResponse(error);
  }
}
