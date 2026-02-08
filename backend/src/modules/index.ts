import { FastifyInstance } from 'fastify';
import { categoryRoutes } from './categories';
import { tagRoutes } from './tags';
import { transactionRoutes } from './transactions';
import { webhookRoutes } from './webhooks';
import { accountRoutes } from './accounts';

export async function appRoutes(app: FastifyInstance) {
  app.register(webhookRoutes, { prefix: '/webhooks' });
  app.register(accountRoutes);
  app.register(categoryRoutes);
  app.register(tagRoutes);
  app.register(transactionRoutes);

  // Health check
  app.get('/health', async () => {
    return { status: 'ok' };
  });
}
