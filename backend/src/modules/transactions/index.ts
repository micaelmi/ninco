import { FastifyInstance } from 'fastify';
import { listTransactions } from './list-transactions';
import { createTransaction } from './create-transaction';
import { createTransfer } from './create-transfer';
import { updateTransaction } from './update-transaction';
import { deleteTransaction } from './delete-transaction';
import { getDashboardSummary } from './get-dashboard-summary';

export async function transactionRoutes(app: FastifyInstance) {
  app.register(listTransactions);
  app.register(createTransaction);
  app.register(createTransfer);
  app.register(updateTransaction);
  app.register(deleteTransaction);
  app.register(getDashboardSummary);
}
