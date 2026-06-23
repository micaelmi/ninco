import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/transactions', {
    schema: {
      tags: ['transactions'],
      summary: 'Create a new transaction',
      body: z.object({
        amount: z.number(),
        type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
        date: z.string().datetime(),
        description: z.string().max(255).optional(),
        accountId: z.uuid(),
        comments: z.string().max(2000).optional(),
        categoryId: z.uuid().optional(),
        tagIds: z.array(z.uuid()).optional(),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          amount: z.string(),
          accountId: z.uuid(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { amount, type, date, description, comments, categoryId, tagIds, accountId } = request.body;

    const account = await prisma.account.findUnique({
      where: { id: accountId, userId },
    });
    if (!account) {
      return reply.status(404).send({ message: 'Account not found' } as any);
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [
            { userId },
            { userId: null },
          ],
        },
      });
      if (!category) return reply.status(404).send({ message: 'Category not found' } as any);
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({ where: { id: { in: tagIds }, userId } });
      if (tags.length !== tagIds.length) return reply.status(404).send({ message: 'One or more tags not found' } as any);
    }

    const transaction = await prisma.$transaction(async (tx: any) => {
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
