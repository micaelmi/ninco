import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/accounts/:id', {
    schema: {
      tags: ['accounts'],
      summary: 'Update an account',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        name: z.string().optional(),
        balance: z.number().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          balance: z.string(),
        }),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params;
    const { name, balance, color, icon } = request.body;

    const account = await prisma.account.update({
      where: { id, userId },
      data: {
        name,
        balance,
        color,
        icon,
      },
    });

    return {
      id: account.id,
      name: account.name,
      balance: account.balance.toString(),
    };
  });
}
