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
        accountId: z.uuid(),
        comments: z.string().optional(),
        categoryId: z.uuid().optional(),
        tagIds: z.array(z.uuid()).optional(),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          amount: z.string(),
          accountId: z.uuid(),
        }),
      },
    },
  }, async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { amount, type, date, description, comments, categoryId, tagIds, accountId } = request.body;

    const transaction = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId,
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

      // Update Account balance
      const balanceChange = type === 'INCOME' ? amount : -amount;
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      return transaction;
    });

    return reply.status(201).send({
      id: transaction.id,
      amount: transaction.amount.toString(),
      accountId: transaction.accountId,
    });
  });
}
