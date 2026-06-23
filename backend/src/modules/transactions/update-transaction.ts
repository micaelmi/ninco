import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/transactions/:id', {
    schema: {
      tags: ['transactions'],
      summary: 'Update a transaction',
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        amount: z.number().optional(),
        type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
        date: z.string().datetime().optional(),
        description: z.string().max(255).optional(),
        accountId: z.uuid().optional(),
        comments: z.string().max(2000).optional(),
        categoryId: z.uuid().nullable().optional(),
        tagIds: z.array(z.uuid()).optional(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          amount: z.string(),
          type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
          date: z.coerce.date(),
          description: z.string().nullable(),
          comments: z.string().nullable(),
          categoryId: z.string().nullable(),
          accountId: z.string(),
          userId: z.string(),
          createdAt: z.coerce.date(),
          updatedAt: z.coerce.date(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { amount, type, date, description, comments, categoryId, tagIds, accountId } = request.body;

    if (accountId) {
      const account = await prisma.account.findUnique({
        where: { id: accountId, userId },
      });
      if (!account) {
        return reply.status(404).send({ message: 'Account not found' } as any);
      }
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
      if (!category) {
        return reply.status(404).send({ message: 'Category not found' } as any);
      }
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await prisma.tag.findMany({
        where: { id: { in: tagIds }, userId },
      });
      if (tags.length !== tagIds.length) {
        return reply.status(404).send({ message: 'One or more tags not found' } as any);
      }
    }

    const transaction = await prisma.$transaction(async (tx: any) => {
      const oldTransaction = await tx.transaction.findUnique({
        where: { id, userId },
      });

      if (!oldTransaction) {
        throw reply.status(404).send({ message: 'Transaction not found' });
      }

      // 1. Revert old balance impact
      const oldBalanceChange = oldTransaction.type === 'INCOME' ? -oldTransaction.amount.toNumber() : oldTransaction.amount.toNumber();
      await tx.account.update({
        where: { id: oldTransaction.accountId },
        data: {
          balance: {
            increment: oldBalanceChange,
          },
        },
      });

      // 2. Apply new balance impact
      const finalAccountId = accountId || oldTransaction.accountId;
      const finalAmount = amount !== undefined ? amount : oldTransaction.amount.toNumber();
      const finalType = type || oldTransaction.type;
      
      const newBalanceChange = finalType === 'INCOME' ? finalAmount : -finalAmount;
      
      await tx.account.update({
        where: { id: finalAccountId },
        data: {
          balance: {
            increment: newBalanceChange,
          },
        },
      });

      // 3. Update the transaction
      const updatedTransaction = await tx.transaction.update({
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

      return updatedTransaction;
    });

    return {
      ...transaction,
      amount: transaction.amount.toString(),
    };
  });
}
