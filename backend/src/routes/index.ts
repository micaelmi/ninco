import { FastifyInstance } from 'fastify';
import { webhookRoutes } from './webhooks';

export async function appRoutes(app: FastifyInstance) {
  app.register(webhookRoutes, { prefix: '/webhooks' });
  
  // Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });
}
