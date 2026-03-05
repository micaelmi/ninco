import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateMe(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/me', {
    schema: {
      tags: ['users'],
      summary: 'Update current user profile & preferences',
      body: z.object({
        preferredCurrencyCode: z.string().optional(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string().nullable(),
          imageUrl: z.string().nullable(),
          preferredCurrencyCode: z.string().nullable(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { preferredCurrencyCode } = request.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        preferredCurrencyCode: preferredCurrencyCode !== undefined ? preferredCurrencyCode : user.preferredCurrencyCode,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      imageUrl: updatedUser.imageUrl,
      preferredCurrencyCode: updatedUser.preferredCurrencyCode,
    };
  });
}
