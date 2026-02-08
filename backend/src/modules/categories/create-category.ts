import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/categories', {
    schema: {
      tags: ['categories'],
      summary: 'Create a new category',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      body: z.object({
        name: z.string(),
        color: z.string().optional(),
      }),
      response: {
        201: z.object({
          id: z.string().uuid(),
          name: z.string(),
          color: z.string().nullable(),
          userId: z.string().nullable(),
          createdAt: z.date(),
        }),
      },
    },
  }, async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { name, color } = request.body;

    const category = await prisma.category.create({
      data: {
        name,
        color,
        userId,
      },
    });

    return reply.status(201).send(category);
  });
}
