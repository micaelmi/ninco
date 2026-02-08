import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function deleteTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/transactions/:id', {
    schema: {
      tags: ['transactions'],
      summary: 'Delete a transaction',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      params: z.object({
        id: z.uuid(),
      }),
      response: {
        204: z.null(),
      },
    },
  }, async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params;

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id, userId },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Revert account balance
      const balanceChange = transaction.type === 'INCOME' ? -transaction.amount.toNumber() : transaction.amount.toNumber();
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      await tx.transaction.delete({
        where: { id, userId },
      });
    });

    return reply.status(204).send(null);
  });
}
