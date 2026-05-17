'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  getTransactions,
  createTransaction,
  createTransfer,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
} from '../api/transactions';
import type {
  Transaction,
  CreateTransactionInput,
  CreateTransferInput,
  UpdateTransactionInput,
  DashboardSummary,
} from '../api/types';

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summaries: () => [...transactionKeys.all, 'summary'] as const,
  summary: (filters: { from: string; to: string }) => 
    [...transactionKeys.summaries(), filters] as const,
};

// Queries
export function useTransactions(filters?: { from?: string; to?: string; page?: number; limit?: number; type?: 'INCOME' | 'EXPENSE' | 'TRANSFER' }) {
  const { user } = useUser();

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDashboardSummary(filters: { from: string; to: string }) {
  const { user } = useUser();

  return useQuery({
    queryKey: transactionKeys.summary(filters),
    queryFn: () => getDashboardSummary(filters),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}

// Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      toast.success('Transaction created');
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
    onError: (err) => {
      toast.error('Failed to create transaction');
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      toast.success('Transfer completed');
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
    onError: (err) => {
      toast.error('Failed to create transfer');
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      toast.success('Transaction updated');
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
    onError: (err) => {
      toast.error('Failed to update transaction');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });
    },
    onSuccess: () => {
      toast.success('Transaction deleted');
    },
    onError: (err) => {
      toast.error('Failed to delete transaction');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}
