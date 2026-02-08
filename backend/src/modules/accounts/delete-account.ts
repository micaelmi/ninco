import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function deleteAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/accounts/:id', {
    schema: {
      tags: ['accounts'],
      summary: 'Delete an account',
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

    // Check if it's not the last account (optional but good practice)
    // For now, just delete. Prisma handles transaction cleanup via Cascade if configured.
    await prisma.account.delete({
      where: { id, userId },
    });

    return reply.status(204).send(null);
  });
}
