import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listCategories(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/categories', {
    schema: {
      tags: ['categories'],
      summary: 'List all categories for a user',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      response: {
        200: z.array(z.object({
          id: z.string().uuid(),
          name: z.string(),
          color: z.string().nullable(),
          userId: z.string().nullable(),
          createdAt: z.date(),
        })),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { userId: null },
        ],
      },
    });

    return categories;
  });
}
