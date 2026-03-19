import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const AI_LIMITS = { normal: 10, premium: 100 } as const;

function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function useCredit(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/ai-credits/use', {
    schema: {
      tags: ['ai-credits'],
      summary: 'Consume one AI credit',
      response: {
        200: z.object({
          remaining: z.number(),
          limit: z.number(),
        }),
        403: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { userType: true },
    });

    const userType = (user.userType?.type ?? 'normal') as keyof typeof AI_LIMITS;
    const limit = AI_LIMITS[userType] ?? AI_LIMITS.normal;
    const monthStart = getMonthStart();

    let credit = await prisma.aiCredit.findUnique({ where: { userId } });

    if (!credit) {
      credit = await prisma.aiCredit.create({
        data: { userId, remaining: limit, limit, periodStart: monthStart },
      });
    } else if (credit.periodStart < monthStart) {
      credit = await prisma.aiCredit.update({
        where: { userId },
        data: { remaining: limit, limit, periodStart: monthStart },
      });
    }

    if (credit.remaining <= 0) {
      return reply.status(403).send({ message: 'AI credits exhausted for this month.' });
    }

    const updated = await prisma.aiCredit.update({
      where: { userId },
      data: { remaining: { decrement: 1 } },
    });

    return { remaining: updated.remaining, limit: updated.limit };
  });
}
