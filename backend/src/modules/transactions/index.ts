import { FastifyInstance } from 'fastify';
import { listTransactions } from './list-transactions';
import { createTransaction } from './create-transaction';
import { updateTransaction } from './update-transaction';
import { deleteTransaction } from './delete-transaction';

export async function transactionRoutes(app: FastifyInstance) {
  app.register(listTransactions);
  app.register(createTransaction);
  app.register(updateTransaction);
  app.register(deleteTransaction);
}
