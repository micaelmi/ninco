import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listAccounts(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/accounts', {
    schema: {
      tags: ['accounts'],
      summary: 'List all accounts for a user',
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          name: z.string(),
          balance: z.string(),
          color: z.string(),
          icon: z.string(),
          userId: z.string(),
          currencyCode: z.string().nullable(),
          isVisible: z.boolean(),
          currency: z.object({
            symbol: z.string(),
            decimalPlaces: z.number(),
          }).nullable(),
          createdAt: z.coerce.date(),
          updatedAt: z.coerce.date(),
        })),
      },
    },
  }, async (request) => {
    const userId = request.userId;

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: { currency: true },
    });

    return accounts.map(account => ({
      ...account,
      balance: account.balance.toString(),
      currency: account.currency ? {
        symbol: account.currency.symbol,
        decimalPlaces: account.currency.decimalPlaces,
      } : null,
    }));
  });
}
