import { FastifyInstance } from 'fastify';
import { listCurrencies } from './list-currencies';

export async function currencyRoutes(app: FastifyInstance) {
  app.register(listCurrencies);
}
