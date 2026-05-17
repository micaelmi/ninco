import { apiClient } from './client';
import type {
  Transaction,
  CreateTransactionInput,
  CreateTransferInput,
  UpdateTransactionInput,
  DashboardSummary,
  GetTransactionsParams,
  GetTransactionsResponse,
} from './types';

export async function getTransactions(filters?: GetTransactionsParams): Promise<GetTransactionsResponse> {
  const response = await apiClient.get<GetTransactionsResponse>('/transactions', {
    params: filters,
  });
  return response.data;
}

export async function getDashboardSummary(filters: { from: string; to: string }): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>('/transactions/summary', {
    params: filters,
  });
  return response.data;
}

export async function createTransaction(
  data: CreateTransactionInput
): Promise<{ id: string; amount: string; accountId: string }> {
  const response = await apiClient.post('/transactions', data);
  return response.data;
}

export async function createTransfer(
  data: CreateTransferInput
): Promise<{ sourceTransactionId: string; destinationTransactionId: string }> {
  const response = await apiClient.post('/transactions/transfer', data);
  return response.data;
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput
): Promise<Transaction> {
  const response = await apiClient.put(`/transactions/${id}`, data);
  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}
