import { z } from 'zod';

export const transactionFormSchema = z.object({
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(999999999, 'Amount is too large'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(255, 'Description is too long'),
  date: z.date({
    message: 'Date is required',
  }),
  accountId: z.string().uuid('Please select an account'),
  comments: z.string().max(1000, 'Comments are too long').optional(),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
