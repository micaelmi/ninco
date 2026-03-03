import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/accounts/:id', {
    schema: {
      tags: ['accounts'],
      summary: 'Update an account',
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        name: z.string().optional(),
        balance: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        currencyCode: z.string().optional(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          balance: z.string(),
          currencyCode: z.string().nullable(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { name, balance, color, icon, currencyCode } = request.body;

    const existing = await prisma.account.findUnique({ where: { id, userId } });
    if (!existing) {
      return reply.status(404).send({ message: 'Account not found' });
    }

    const account = await prisma.account.update({
      where: { id, userId },
      data: { name, balance, color, icon, currencyCode },
    });

    return {
      id: account.id,
      name: account.name,
      balance: account.balance.toString(),
      currencyCode: account.currencyCode,
    };
  });
}
