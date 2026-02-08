import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listTags(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/tags', {
    schema: {
      tags: ['tags'],
      summary: 'List all tags for a user',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          name: z.string(),
          userId: z.string(),
          createdAt: z.date(),
        })),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;

    const tags = await prisma.tag.findMany({
      where: { userId },
    });

    return tags;
  });
}
