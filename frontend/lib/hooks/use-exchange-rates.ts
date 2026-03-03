import { useQuery } from '@tanstack/react-query';

interface CurrencyRatesResponse {
  date: string;
  [baseCurrencyCode: string]: Record<string, number> | string;
}

export function useExchangeRates(baseCurrency: string = 'usd') {
  const code = baseCurrency.toLowerCase();
  return useQuery({
    queryKey: ['exchange-rates', code],
    queryFn: async () => {
      // Free CDN API for currency pairs vs one base currency
      const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.json`);
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      const data = await response.json() as CurrencyRatesResponse;
      return data[code] as Record<string, number>;
    },
    // Rates update daily on this free API, cache for 12 hours
    staleTime: 12 * 60 * 60 * 1000, 
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Convert an amount from its native currency to another currency using provided rates.
 * The `rates` object must be rooted from a `useExchangeRates(toCode)` hook call!
 */
export function convertCurrency(amount: number, fromCode: string, toCode: string, rates?: Record<string, number>): number {
  if (fromCode.toLowerCase() === toCode.toLowerCase()) return amount;
  if (!rates) return amount; // Cannot convert without rates, return original amount
  
  // The rates object contains exchange rates FROM `toCode` TO all other currencies.
  // rates[fromCode.toLowerCase()] is how many `fromCode` equal 1 `toCode`.
  // To convert `amount` of `fromCode` into `toCode`, we divide:
  const rateToSource = rates[fromCode.toLowerCase()];
  if (!rateToSource) return amount; // Currency not found in rates tree

  return amount / rateToSource;
}
