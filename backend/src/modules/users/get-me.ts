import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function getMe(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/me', {
    schema: {
      tags: ['users'],
      summary: 'Get current user profile & preferences',
      response: {
        200: z.object({
          id: z.string(),
          email: z.string(),
          name: z.string().nullable(),
          imageUrl: z.string().nullable(),
          preferredCurrencyCode: z.string().nullable(),
          defaultAccountId: z.string().nullable(),
          defaultPeriod: z.string().nullable(),
          userType: z.object({
            type: z.string(),
            description: z.string().nullable(),
          }).nullable(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userType: true },
    });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      preferredCurrencyCode: user.preferredCurrencyCode,
      defaultAccountId: user.defaultAccountId ?? null,
      defaultPeriod: user.defaultPeriod ?? null,
      userType: user.userType ? {
        type: user.userType.type,
        description: user.userType.description,
      } : null,
    };
  });
}
