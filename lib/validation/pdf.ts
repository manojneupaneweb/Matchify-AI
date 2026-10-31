import { AppError } from '../errors';

export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_JD_CHARS = 20_000;
export const MAX_RESUME_CHARS = 50_000;
export const MAX_PDF_PAGES = 10;

export function assertPdf(buffer: Buffer) {
  if (buffer.length === 0) {
    throw new AppError('INVALID_FILE', 'That file is empty.', 400);
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new AppError('PAYLOAD_TOO_LARGE', 'PDF has to be 5 MB or smaller.', 413);
  }
  const magic = buffer.subarray(0, 5).toString('utf8');
  if (magic !== '%PDF-') {
    throw new AppError('INVALID_FILE', 'That file is not a PDF.', 400);
  }
}

export function assertPageCount(pages: number) {
  if (!Number.isFinite(pages) || pages < 1) {
    throw new AppError('INVALID_FILE', 'Could not read this PDF. The file may be corrupt.', 400);
  }
  if (pages > MAX_PDF_PAGES) {
    throw new AppError('PAYLOAD_TOO_LARGE', `PDF can be at most ${MAX_PDF_PAGES} pages.`, 413);
  }
}

export function assertResumeText(text: string) {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length < 40) {
    throw new AppError(
      'EMPTY_RESUME',
      'Could not read this PDF. Is it a scanned image?',
      422,
    );
  }
  if (trimmed.length > MAX_RESUME_CHARS) {
    throw new AppError('PAYLOAD_TOO_LARGE', 'Resume text is too long to analyze.', 413);
  }
  return trimmed;
}
