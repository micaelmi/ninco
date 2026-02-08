import { apiClient } from './client';
import type { Account, CreateAccountInput, UpdateAccountInput } from './types';

export async function getAccounts(): Promise<Account[]> {
  const response = await apiClient.get<Account[]>('/accounts');
  return response.data;
}

export async function getAccount(id: string): Promise<Account> {
  const response = await apiClient.get<Account>(`/accounts/${id}`);
  return response.data;
}

export async function createAccount(
  data: CreateAccountInput
): Promise<Account> {
  const response = await apiClient.post<Account>('/accounts', data);
  return response.data;
}

export async function updateAccount(
  id: string,
  data: UpdateAccountInput
): Promise<Account> {
  const response = await apiClient.put<Account>(`/accounts/${id}`, data);
  return response.data;
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.delete(`/accounts/${id}`);
}
