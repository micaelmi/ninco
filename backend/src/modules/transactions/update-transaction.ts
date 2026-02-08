import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/transactions/:id', {
    schema: {
      tags: ['transactions'],
      summary: 'Update a transaction',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        amount: z.number().optional(),
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
        date: z.string().datetime().optional(),
        description: z.string().optional(),
        accountId: z.uuid().optional(),
        comments: z.string().optional(),
        categoryId: z.uuid().nullable().optional(),
        tagIds: z.array(z.uuid()).optional(),
      }),
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params;
    const { amount, type, date, description, comments, categoryId, tagIds, accountId } = request.body;

    const transaction = await prisma.transaction.update({
      where: { id, userId },
      data: {
        amount,
        type,
        date: date ? new Date(date) : undefined,
        description,
        comments,
        categoryId,
        accountId,
        tags: tagIds ? {
          set: tagIds.map(id => ({ id })),
        } : undefined,
      },
    });

    return {
      ...transaction,
      amount: transaction.amount.toString(),
    };
  });
}
