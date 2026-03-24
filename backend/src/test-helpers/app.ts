import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { mockAuthPlugin, TEST_USER_ID } from './auth-mock';

// Import all route modules individually (to wire mock auth instead of real auth)
import { categoryRoutes } from '../modules/categories';
import { tagRoutes } from '../modules/tags';
import { transactionRoutes } from '../modules/transactions';
import { webhookRoutes } from '../modules/webhooks';
import { accountRoutes } from '../modules/accounts';
import { currencyRoutes } from '../modules/currencies';
import { userRoutes } from '../modules/users';
import { aiCreditRoutes } from '../modules/ai-credits';
import { reportRoutes } from '../modules/reports';
import { feedbackRoutes } from '../modules/feedback/feedback.routes';

/**
 * Build a Fastify app configured for testing.
 * Uses the mock auth plugin instead of the real Clerk-based one.
 */
export async function buildTestApp() {
  const app = fastify({ logger: false }).withTypeProvider();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Register routes (same structure as modules/index.ts but with mock auth)
  app.register(async (rootApp) => {
    // Public routes
    rootApp.register(webhookRoutes, { prefix: '/webhooks' });
    rootApp.get('/health', async () => ({ status: 'ok' }));

    // Protected routes — use mock auth
    rootApp.register(async (protectedApp) => {
      protectedApp.register(mockAuthPlugin);
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
  });

  // Global error handler — mirrors production behavior
  app.setErrorHandler((error: Error & { validation?: unknown }, request, reply) => {
    if (error.validation) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.validation,
      });
    }
    reply.status(500).send({ message: 'Internal server error' });
  });

  await app.ready();
  return app;
}

/**
 * Convenience: inject a request with a valid auth header.
 */
export function authHeaders(userId?: string) {
  return {
    authorization: 'Bearer test-token',
    ...(userId ? { 'x-test-user-id': userId } : {}),
  };
}

export { TEST_USER_ID };
