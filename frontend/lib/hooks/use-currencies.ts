import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const response = await apiClient.get('/currencies');
      return response.data as Currency[];
    },
    // Currencies rarely change, cache for 24 hours
    staleTime: 24 * 60 * 60 * 1000, 
    gcTime: 24 * 60 * 60 * 1000,
  });
}
