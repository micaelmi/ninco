import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/categories/:id', {
    schema: {
      tags: ['categories'],
      summary: 'Update a category',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      params: z.object({
        id: z.string().uuid(),
      }),
      body: z.object({
        name: z.string().optional(),
        color: z.string().optional(),
      }),
      response: {
        200: z.object({
          id: z.string().uuid(),
          name: z.string(),
          color: z.string().nullable(),
          userId: z.string().nullable(),
          createdAt: z.date(),
        }),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params;
    const { name, color } = request.body;

    const category = await prisma.category.update({
      where: { id, userId },
      data: {
        name,
        color,
      },
    });

    return category;
  });
}
