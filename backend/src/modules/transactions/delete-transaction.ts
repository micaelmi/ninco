import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function deleteTransaction(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/transactions/:id', {
    schema: {
      tags: ['transactions'],
      summary: 'Delete a transaction',
      params: z.object({
        id: z.uuid(),
      }),
      response: {
        204: z.null(),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;

    await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.findUnique({
        where: { id, userId },
      });

      if (!transaction) {
        throw reply.status(404).send({ message: 'Transaction not found' });
      }

      // Revert account balance
      let balanceChange: number;
      if (transaction.type === 'TRANSFER') {
        // "Transfer to X" = outgoing (was decremented), revert by adding back
        // "Transfer from X" = incoming (was incremented), revert by subtracting
        const isOutgoing = transaction.description?.startsWith('Transfer to ') || 
                           transaction.description?.includes('— Transfer to ');
        balanceChange = isOutgoing ? transaction.amount.toNumber() : -transaction.amount.toNumber();
      } else {
        balanceChange = transaction.type === 'INCOME' ? -transaction.amount.toNumber() : transaction.amount.toNumber();
      }
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
