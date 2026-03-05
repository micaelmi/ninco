import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface UserPreferences {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  preferredCurrencyCode: string | null;
  userType: {
    type: string;
    description: string | null;
  } | null;
}

export function useUser() {
  return useQuery({
    queryKey: ['user', 'preferences'],
    queryFn: async () => {
      const response = await apiClient.get('/users/me');
      return response.data as UserPreferences;
    },
    staleTime: 24 * 60 * 60 * 1000, // cache for 24h as per plan
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { preferredCurrencyCode?: string }) => {
      const response = await apiClient.put('/users/me', data);
      return response.data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'preferences'] });
      // Might want to invalidate dashboard and exchange-rates as well
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
    },
  });
}
