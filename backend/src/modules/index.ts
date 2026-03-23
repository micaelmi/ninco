import { FastifyInstance } from 'fastify';
import { authPlugin } from '../lib/auth';
import { categoryRoutes } from './categories';
import { tagRoutes } from './tags';
import { transactionRoutes } from './transactions';
import { webhookRoutes } from './webhooks';
import { accountRoutes } from './accounts';
import { currencyRoutes } from './currencies';
import { userRoutes } from './users';
import { aiCreditRoutes } from './ai-credits';
import { reportRoutes } from './reports';

import { feedbackRoutes } from './feedback/feedback.routes';

export async function appRoutes(app: FastifyInstance) {
  // Webhooks and health check are public — registered before auth
  app.register(webhookRoutes, { prefix: '/webhooks' });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  // All remaining routes are protected by Clerk JWT auth
  app.register(async (protectedApp) => {
    protectedApp.register(authPlugin);
    protectedApp.register(accountRoutes);
    protectedApp.register(categoryRoutes);
    protectedApp.register(tagRoutes);
    protectedApp.register(transactionRoutes);
    protectedApp.register(feedbackRoutes, { prefix: '/feedback' });
    protectedApp.register(currencyRoutes);
    protectedApp.register(userRoutes, { prefix: '/users' });
    protectedApp.register(aiCreditRoutes);
    protectedApp.register(reportRoutes);
  });
}
