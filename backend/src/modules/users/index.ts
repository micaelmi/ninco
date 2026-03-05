import { FastifyInstance } from 'fastify';
import { getMe } from './get-me';
import { updateMe } from './update-me';

export async function userRoutes(app: FastifyInstance) {
  app.register(getMe);
  app.register(updateMe);
}
