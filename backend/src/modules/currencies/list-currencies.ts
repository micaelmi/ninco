import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listCurrencies(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/currencies', {
    schema: {
      tags: ['currencies'],
      summary: 'List all supported currencies',
      response: {
        200: z.array(z.object({
          code: z.string(),
          name: z.string(),
          symbol: z.string(),
          decimalPlaces: z.number(),
        })),
      },
    },
  }, async (request) => {
    // Return all currencies ordered by code
    const currencies = await prisma.currency.findMany({
      orderBy: { code: 'asc' },
    });
    return currencies;
  });
}
