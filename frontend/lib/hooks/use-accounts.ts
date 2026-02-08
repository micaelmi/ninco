'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../api/accounts';
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from '../api/types';

// Query Keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountKeys.details(), id] as const,
};

// Queries
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: getAccounts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => getAccount(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Mutations
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountInput }) =>
      updateAccount(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccount,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.lists() });

      const previousAccounts = queryClient.getQueryData<Account[]>(
        accountKeys.lists()
      );

      queryClient.setQueryData<Account[]>(
        accountKeys.lists(),
        (old) => old?.filter((a) => a.id !== deletedId) ?? []
      );

      return { previousAccounts };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousAccounts) {
        queryClient.setQueryData(
          accountKeys.lists(),
          context.previousAccounts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
      // Also invalidate transactions as they reference accounts
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
