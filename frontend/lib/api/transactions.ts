import { apiClient } from './client';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from './types';

export async function getTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<Transaction[]>('/transactions');
  return response.data;
}

export async function createTransaction(
  data: CreateTransactionInput
): Promise<{ id: string; amount: string; accountId: string }> {
  const response = await apiClient.post('/transactions', data);
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
