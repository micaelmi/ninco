import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/transactions', {
    schema: {
      tags: ['transactions'],
      summary: 'Create a new transaction',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      body: z.object({
        amount: z.number(),
        type: z.enum(['INCOME', 'EXPENSE']),
        date: z.string().datetime(),
        description: z.string(),
        comments: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        tagIds: z.array(z.string().uuid()).optional(),
      }),
      response: {
        201: z.object({
          id: z.string().uuid(),
          amount: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { amount, type, date, description, comments, categoryId, tagIds } = request.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type,
        date: new Date(date),
        description,
        comments,
        categoryId,
        tags: tagIds ? {
          connect: tagIds.map(id => ({ id })),
        } : undefined,
      },
    });

    return reply.status(201).send({
      id: transaction.id,
      amount: transaction.amount.toString(),
    });
  });
}
