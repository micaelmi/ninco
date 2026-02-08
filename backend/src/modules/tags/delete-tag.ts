import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function deleteTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/tags/:id', {
    schema: {
      tags: ['tags'],
      summary: 'Delete a tag',
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

    await prisma.tag.delete({
      where: { id, userId },
    });

    return reply.status(204).send(null);
  });
}
