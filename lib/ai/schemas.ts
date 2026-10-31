import { z } from 'zod';

export const cleanedResumeSchema = z.object({
  text: z.string().min(1),
  warnings: z.array(z.string()).default([]),
});

export const jobRequirementsSchema = z.object({
  mustHaveSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  experienceLevel: z.string().default('unknown'),
  domain: z.string().default(''),
});

export const resumeProfileSchema = z.object({
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        title: z.string().default(''),
        years: z.number().default(0),
      }),
    )
    .default([]),
  education: z.array(z.string()).default([]),
  summary: z.string().default(''),
});

export const explanationSchema = z.object({
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  funnyMessage: z.string().default(''),
});

export const suggestionsSchema = z.object({
  suggestions: z.array(z.string()).default([]),
  rewrites: z
    .array(
      z.object({
        before: z.string(),
        after: z.string(),
        reason: z.string().default(''),
      }),
    )
    .default([]),
});

export const rewriteSchema = z.object({
  summary: z.string().min(1),
});

export type JobRequirements = z.infer<typeof jobRequirementsSchema>;
export type ResumeProfile = z.infer<typeof resumeProfileSchema>;
export type Suggestions = z.infer<typeof suggestionsSchema>;
