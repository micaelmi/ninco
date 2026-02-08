import { FastifyInstance } from 'fastify';
import { clerkSync } from './clerk-sync';

export async function webhookRoutes(app: FastifyInstance) {
  app.register(clerkSync);
}
