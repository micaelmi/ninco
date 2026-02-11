import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().min(4, 'Please select a color'),
  icon: z.string().min(1, 'Please select an icon'),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
