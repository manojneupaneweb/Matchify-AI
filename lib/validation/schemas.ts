import { z } from 'zod';
import { MAX_JD_CHARS } from './pdf';

export const jobDescriptionSchema = z
  .string()
  .trim()
  .min(40, 'Job description is too short.')
  .max(MAX_JD_CHARS, 'Job description is too long.');

export const profileUpdateSchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(200).optional(),
  profilePic: z.string().trim().max(500).optional(),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

export const jdIdeaSchema = z.object({
  idea: z.string().trim().min(8).max(4000),
  tone: z.string().trim().max(40).optional(),
});
