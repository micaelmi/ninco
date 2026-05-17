import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listCategories(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/categories', {
    schema: {
      tags: ['categories'],
      summary: 'List all categories for a user',
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          name: z.string(),
          color: z.string().nullable(),
          icon: z.string().nullable(),
          type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
          userId: z.string().nullable(),
          createdAt: z.coerce.date(),
        })),
      },
    },
  }, async (request) => {
    const userId = request.userId;

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
