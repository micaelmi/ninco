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
      querystring: z.object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      }),
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          userId: z.string(),
          accountId: z.uuid(),
          amount: z.string(),
          type: z.enum(['INCOME', 'EXPENSE']),
          date: z.coerce.date(),
          description: z.string(),
          comments: z.string().nullable(),
          categoryId: z.uuid().nullable(),
          createdAt: z.coerce.date(),
          updatedAt: z.coerce.date(),
          category: z.nullable(z.object({
            id: z.uuid(),
            name: z.string(),
            color: z.string().nullable(),
            icon: z.string().nullable(),
          })),
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
    const { from, to } = request.query;

    const transactions = await prisma.transaction.findMany({
      where: { 
        userId,
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } },
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
