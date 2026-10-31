import { errorResponse } from '@/lib/http';
import { requireUser } from '@/lib/services/session';
import { deleteUserAnalyses } from '@/lib/services/analysis';

export async function DELETE() {
  try {
    const user = await requireUser();
    const deleted = await deleteUserAnalyses(user.email);
    return Response.json({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
