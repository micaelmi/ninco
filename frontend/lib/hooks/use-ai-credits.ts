import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface AiCredits {
  remaining: number;
  limit: number;
  userType: string;
}

export function useAiCredits() {
  return useQuery({
    queryKey: ['ai-credits'],
    queryFn: async () => {
      const response = await apiClient.get('/ai-credits');
      return response.data as AiCredits;
    },
    staleTime: 60 * 1000, // 1 min
  });
}

export function useConsumeAiCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/ai-credits/use');
      return response.data as { remaining: number; limit: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-credits'] });
    },
  });
}
