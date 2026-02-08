import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/accounts', {
    schema: {
      tags: ['accounts'],
      summary: 'Create a new account',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      body: z.object({
        name: z.string(),
        balance: z.number().default(0),
        color: z.string(),
        icon: z.string(),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          name: z.string(),
          balance: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { name, balance, color, icon } = request.body;

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        balance,
        color,
        icon,
      },
    });

    return reply.status(201).send({
      id: account.id,
      name: account.name,
      balance: account.balance.toString(),
    });
  });
}
