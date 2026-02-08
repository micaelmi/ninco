'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
} from '../api/tags';
import type { Tag, CreateTagInput, UpdateTagInput } from '../api/types';

// Query Keys
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...tagKeys.lists(), filters] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

// Queries
export function useTags() {
  return useQuery({
    queryKey: tagKeys.lists(),
    queryFn: getTags,
    staleTime: 1000 * 60 * 10, // 10 minutes (tags change less frequently)
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: () => getTag(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

// Mutations
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagInput }) =>
      updateTag(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
      // Invalidate transactions as they reference tags
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: tagKeys.lists() });

      const previousTags = queryClient.getQueryData<Tag[]>(tagKeys.lists());

      queryClient.setQueryData<Tag[]>(
        tagKeys.lists(),
        (old) => old?.filter((t) => t.id !== deletedId) ?? []
      );

      return { previousTags };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousTags) {
        queryClient.setQueryData(tagKeys.lists(), context.previousTags);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
