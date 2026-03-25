import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formattersCache = new Map<string, Intl.NumberFormat>();

/**
 * Format a number as a currency string (e.g., "$1,234.56").
 * Optionally provide a currency code and decimal places to override defaults.
 */

export function formatCurrency(
  value: number,
  currencyCode?: string | null,
  decimalPlaces: number = 2
): string {
  const code = currencyCode || process.env.NEXT_PUBLIC_CURRENCY || 'USD';
  const locale = process.env.NEXT_PUBLIC_LOCALE || 'en-US';
  const cacheKey = `${locale}-${code}-${decimalPlaces}`;

  if (!formattersCache.has(cacheKey)) {
    try {
      formattersCache.set(cacheKey, new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }));
    } catch {
      // Fallback if currency code is invalid for the locale system
      formattersCache.set(cacheKey, new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimalPlaces,
      }));
    }
  }

  return formattersCache.get(cacheKey)!.format(value);
}

/**
 * Format a date automatically depending on the user's location.
 */
export function formatDate(date: string | Date): string {
  const locale = typeof window !== 'undefined' ? window.navigator.language : 'en-US';
  return new Intl.DateTimeFormat(locale).format(new Date(date));
}
