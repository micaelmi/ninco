import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createTransfer(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/transactions/transfer', {
    schema: {
      tags: ['transactions'],
      summary: 'Create a transfer between two accounts',
      body: z.object({
        fromAccountId: z.uuid(),
        toAccountId: z.uuid(),
        amountFrom: z.number().positive(),
        amountTo: z.number().positive(),
        date: z.string().datetime(),
        description: z.string().optional(),
        comments: z.string().optional(),
      }).refine(data => data.fromAccountId !== data.toAccountId, {
        message: 'Source and destination accounts must be different',
        path: ['toAccountId'],
      }),
      response: {
        201: z.object({
          sourceTransactionId: z.uuid(),
          destinationTransactionId: z.uuid(),
        }),
        404: z.object({
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { fromAccountId, toAccountId, amountFrom, amountTo, date, description, comments } = request.body;

    // Fetch account names for auto-generated descriptions
    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: fromAccountId, userId }, select: { name: true } }),
      prisma.account.findUnique({ where: { id: toAccountId, userId }, select: { name: true } }),
    ]);

    if (!fromAccount || !toAccount) {
      return reply.status(404).send({ message: 'One or both accounts not found' } as any);
    }

    const descPrefix = description ? `${description} — ` : '';
    const sourceDesc = `${descPrefix}Transfer to ${toAccount.name}`;
    const destDesc = `${descPrefix}Transfer from ${fromAccount.name}`;

    const result = await prisma.$transaction(async (tx) => {
      // Create source transaction (outgoing)
      const sourceTransaction = await tx.transaction.create({
        data: {
          userId,
          accountId: fromAccountId,
          amount: amountFrom,
          type: 'TRANSFER',
          date: new Date(date),
          description: sourceDesc,
          comments,
        },
      });

      // Create destination transaction (incoming)
      const destTransaction = await tx.transaction.create({
        data: {
          userId,
          accountId: toAccountId,
          amount: amountTo,
          type: 'TRANSFER',
          date: new Date(date),
          description: destDesc,
          comments,
        },
      });

      // Update source account balance (subtract)
      await tx.account.update({
        where: { id: fromAccountId },
        data: {
          balance: {
            decrement: amountFrom,
          },
        },
      });

      // Update destination account balance (add)
      await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: {
            increment: amountTo,
          },
        },
      });

      return {
        sourceTransactionId: sourceTransaction.id,
        destinationTransactionId: destTransaction.id,
      };
    });

    return reply.status(201).send(result);
  });
}
