import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/tags', {
    schema: {
      tags: ['tags'],
      summary: 'Create a new tag',
      headers: z.object({
        'x-user-id': z.string().describe('Clerk User ID'),
      }),
      body: z.object({
        name: z.string(),
      }),
      response: {
        201: z.object({
          id: z.string().uuid(),
          name: z.string(),
          userId: z.string(),
          createdAt: z.date(),
        }),
      },
    },
  }, async (request, reply) => {
    const userId = request.headers['x-user-id'] as string;
    const { name } = request.body;

    const tag = await prisma.tag.create({
      data: {
        name,
        userId,
      },
    });

    return reply.status(201).send(tag);
  });
}
