import { z } from 'zod';

export const feedbackSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
