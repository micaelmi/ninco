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
        id: z.uuid(),
      }),
      body: z.object({
        name: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        type: z.enum(['INCOME', 'EXPENSE']).optional(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          color: z.string().nullable(),
          icon: z.string().nullable(),
          type: z.enum(['INCOME', 'EXPENSE']),
          userId: z.string().nullable(),
          createdAt: z.date(),
        }),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params;
    const { name, color, icon, type } = request.body;

    const category = await prisma.category.update({
      where: { id, userId },
      data: {
        name,
        color,
        icon,
        type,
      },
    });

    return category;
  });
}
