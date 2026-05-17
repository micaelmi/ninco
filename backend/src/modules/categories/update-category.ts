import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/categories/:id', {
    schema: {
      tags: ['categories'],
      summary: 'Update a category',
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        name: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          color: z.string().nullable(),
          icon: z.string().nullable(),
          type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
          userId: z.string().nullable(),
          createdAt: z.date(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { name, color, icon, type } = request.body;

    const existing = await prisma.category.findUnique({ where: { id, userId } });
    if (!existing) {
      return reply.status(404).send({ message: 'Category not found' });
    }

    const category = await prisma.category.update({
      where: { id, userId },
      data: { name, color, icon, type },
    });

    return category;
  });
}
