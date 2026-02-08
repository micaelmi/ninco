import { FastifyInstance } from 'fastify';
import { listAccounts } from './list-accounts';
import { createAccount } from './create-account';
import { updateAccount } from './update-account';
import { deleteAccount } from './delete-account';

export async function accountRoutes(app: FastifyInstance) {
  app.register(listAccounts);
  app.register(createAccount);
  app.register(updateAccount);
  app.register(deleteAccount);
}
