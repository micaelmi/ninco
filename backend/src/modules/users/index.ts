import { FastifyInstance } from 'fastify';
import { getMe } from './get-me';

export async function userRoutes(app: FastifyInstance) {
  app.register(getMe);
}
