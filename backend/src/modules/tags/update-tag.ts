import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/tags/:id', {
    schema: {
      tags: ['tags'],
      summary: 'Update a tag',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        name: z.string(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          userId: z.string(),
          createdAt: z.date(),
        }),
      },
    },
  }, async (request) => {
    const userId = request.headers['x-user-id'] as string;
    const { id } = request.params;
    const { name } = request.body;

    const tag = await prisma.tag.update({
      where: { id, userId },
      data: { name },
    });

    return tag;
  });
}
