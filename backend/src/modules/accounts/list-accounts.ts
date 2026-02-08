import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listAccounts(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/accounts', {
    schema: {
      tags: ['accounts'],
      summary: 'List all accounts for a user',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          name: z.string(),
          balance: z.string(),
          color: z.string(),
          icon: z.string(),
          userId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;

    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    return accounts.map(account => ({
      ...account,
      balance: account.balance.toString(),
    }));
  });
}
