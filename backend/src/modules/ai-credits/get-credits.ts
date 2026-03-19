import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const AI_LIMITS = { normal: 10, premium: 100 } as const;

function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getCredits(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/ai-credits', {
    schema: {
      tags: ['ai-credits'],
      summary: 'Get current AI credits for the authenticated user',
      response: {
        200: z.object({
          remaining: z.number(),
          limit: z.number(),
          userType: z.string(),
        }),
      },
    },
  }, async (request) => {
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
      // First time — create the record
      credit = await prisma.aiCredit.create({
        data: { userId, remaining: limit, limit, periodStart: monthStart },
      });
    } else if (credit.periodStart < monthStart) {
      // New month — reset credits
      credit = await prisma.aiCredit.update({
        where: { userId },
        data: { remaining: limit, limit, periodStart: monthStart },
      });
    } else if (credit.limit !== limit) {
      // User type changed (e.g. upgraded) — update the limit
      credit = await prisma.aiCredit.update({
        where: { userId },
        data: { limit },
      });
    }

    return {
      remaining: credit.remaining,
      limit: credit.limit,
      userType,
    };
  });
}
