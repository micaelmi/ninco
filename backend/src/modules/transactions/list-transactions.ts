import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listTransactions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/transactions', {
    schema: {
      tags: ['transactions'],
      summary: 'List all transactions for a user',
      querystring: z.object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
      }),
      response: {
        200: z.object({
          data: z.array(z.object({
            id: z.uuid(),
            userId: z.string(),
            accountId: z.uuid(),
            amount: z.string(),
            type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
            date: z.coerce.date(),
            description: z.string().nullable(),
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
          meta: z.object({
            total: z.number(),
            page: z.number(),
            totalPages: z.number(),
          }),
        }),
      },
    },
  }, async (request) => {
    const userId = request.userId;
    const { from, to, page, limit, type } = request.query;

    const skip = (page - 1) * limit;

    const where = {
      userId,
      date: {
        gte: from,
        lte: to,
      },
      ...(type ? { type } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          account: { select: { id: true, name: true } },
          tags: { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map((t: any) => ({
        ...t,
        amount: t.amount.toString(),
      })),
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  });
}
