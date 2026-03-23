import { FastifyInstance } from 'fastify';
import { getCredits } from './get-credits';
import { useCredit } from './use-credit';

export async function aiCreditRoutes(app: FastifyInstance) {
  app.register(getCredits);
  app.register(useCredit);
}
