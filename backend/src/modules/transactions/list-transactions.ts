import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/transactions', {
    schema: {
      tags: ['transactions'],
      summary: 'List all transactions for a user',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          userId: z.string(),
          accountId: z.uuid(),
          amount: z.string(),
          type: z.enum(['INCOME', 'EXPENSE']),
          date: z.date(),
          description: z.string(),
          comments: z.string().nullable(),
          categoryId: z.uuid().nullable(),
          createdAt: z.date(),
          updatedAt: z.date(),
          category: z.object({
            id: z.uuid(),
            name: z.string(),
          }).nullable(),
          account: z.object({
            id: z.uuid(),
            name: z.string(),
          }),
          tags: z.array(z.object({
            id: z.uuid(),
            name: z.string(),
          })),
        })),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true } },
        account: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map(t => ({
      ...t,
      amount: t.amount.toString(),
    }));
  });
}
