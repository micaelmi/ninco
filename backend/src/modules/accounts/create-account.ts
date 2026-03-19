import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/accounts', {
    schema: {
      tags: ['accounts'],
      summary: 'Create a new account',
      body: z.object({
        name: z.string(),
        balance: z.number().default(0),
        color: z.string(),
        icon: z.string(),
        currencyCode: z.string().optional(),
        isVisible: z.boolean().optional(),
      }),
      response: {
        201: z.object({
          id: z.uuid(),
          name: z.string(),
          balance: z.string(),
          currencyCode: z.string().nullable(),
          isVisible: z.boolean(),
        }),
        400: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { name, balance, color, icon, currencyCode, isVisible } = request.body;
    
    // Ensure user exists locally
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      return reply.status(400).send({ 
        message: 'User record not found. Please ensure your account is synced via webhook.' 
      });
    }

    try {
      const account = await prisma.account.create({
        data: {
          userId,
          name,
          balance,
          color,
          icon,
          currencyCode: currencyCode || 'USD',
          isVisible: isVisible ?? true,
        },
      });

      return reply.status(201).send({
        id: account.id,
        name: account.name,
        balance: account.balance.toString(),
        currencyCode: account.currencyCode,
        isVisible: account.isVisible,
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        return reply.status(400).send({ message: 'User not found or invalid reference.' });
      }
      throw error; // Let global handler deal with others
    }
  });
}
