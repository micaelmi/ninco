import { subDays } from 'date-fns';

export interface AiTransactionResult {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  date: Date;
  accountId?: string;
  categoryId?: string;
  tagIds?: string[];
  comments?: string;
}

interface ContextItem {
  id: string;
  name: string;
}

interface ParseContext {
  accounts: ContextItem[];
  categories: (ContextItem & { type: 'INCOME' | 'EXPENSE' })[];
  tags: ContextItem[];
  defaultAccountId?: string;
}

function resolveDateString(dateStr: string): Date {
  const today = new Date();
  switch (dateStr) {
    case 'today': return today;
    case 'yesterday': return subDays(today, 1);
    case '2daysago': return subDays(today, 2);
    case '3daysago': return subDays(today, 3);
    default: {
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? today : parsed;
    }
  }
}

export async function parseTransactionMessage(
  message: string,
  context: ParseContext
): Promise<AiTransactionResult> {
  const response = await fetch('/api/ai/parse-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to parse transaction message.');
  }

  const parsed = await response.json();

  return {
    type: parsed.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: Number(parsed.amount) || 0,
    description: parsed.description || undefined,
    date: resolveDateString(parsed.date || 'today'),
    accountId: parsed.accountId || context.defaultAccountId || undefined,
    categoryId: parsed.categoryId || undefined,
    tagIds: Array.isArray(parsed.tagIds) ? parsed.tagIds : [],
    comments: parsed.comments || undefined,
  };
}
