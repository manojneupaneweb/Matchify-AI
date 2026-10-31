import { z } from 'zod';
import { generateStructured } from '../ai/gemini';
import { fence, UNTRUSTED_RULES } from '../ai/prompts/shared';

const responseSchema = { type: 'OBJECT' };

const jobPostingSchema = z.object({
  title: z.string(),
  summary: z.string(),
  responsibilities: z.array(z.string()),
  skills: z.array(z.string()),
  qualifications: z.array(z.string()),
  experience: z.string(),
});

const coverLetterSchema = z.object({
  coverLetter: z.string(),
});

export async function writeJobDescription(idea: string, tone = 'professional') {
  const result = await generateStructured({
    step: 'job-description',
    schema: jobPostingSchema,
    responseSchema,
    system: `${UNTRUSTED_RULES}
Turn the job idea into a posting. Tone: ${tone}.
Return JSON with title, summary, responsibilities, skills, qualifications, experience.
Do not invent rare tools that the idea never implied.`,
    user: fence('JOB_IDEA', idea),
  });
  return result.data;
}

export async function writeCoverLetter(resumeText: string, jobDescription: string) {
  const result = await generateStructured({
    step: 'cover-letter',
    schema: coverLetterSchema,
    responseSchema,
    system: `${UNTRUSTED_RULES}
Write a 3 to 4 paragraph cover letter from the resume and job description.
Do not invent employers or dates. Return JSON with a coverLetter string.`,
    user: `${fence('RESUME', resumeText)}\n${fence('JOB_DESCRIPTION', jobDescription)}`,
  });
  return result.data;
}
