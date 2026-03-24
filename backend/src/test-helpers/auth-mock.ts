import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Re-use the same module augmentation from the real auth plugin
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

export const TEST_USER_ID = 'test-user-001';

/**
 * Mock auth plugin for tests.
 * Instead of verifying a Clerk JWT, it reads the user ID from:
 *   1. `x-test-user-id` header (to test with different users)
 *   2. Falls back to the default TEST_USER_ID
 *
 * If the Authorization header is completely missing, it still returns 401
 * so we can test auth-rejection scenarios by omitting the header.
 */
export const mockAuthPlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest('userId', '');

  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid Authorization header' });
    }

    // In tests, accept any Bearer token and use x-test-user-id or the default
    request.userId = (request.headers['x-test-user-id'] as string) || TEST_USER_ID;
  });
});
