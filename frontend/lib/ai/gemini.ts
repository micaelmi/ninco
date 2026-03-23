import { GoogleGenerativeAI } from '@google/generative-ai';
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

const SYSTEM_PROMPT = `You are a financial transaction parser for the Ninco personal finance app.
Your job is to parse natural language messages into structured transaction data.

Rules:
- Return ONLY a valid JSON object, no markdown, no explanation.
- "type" must be "EXPENSE" (default) or "INCOME" (if it's clearly income like salary, payment received, refund).
- "amount" must be a positive number (no currency symbols).
- "date" must be one of: "today", "yesterday", "2daysago", "3daysago", or an ISO date string (YYYY-MM-DD).
- "description" is the name/label of the transaction.
- "accountId" match by account name from the provided list (case-insensitive). If not specified or ambiguous, use the defaultAccountId.
- "categoryId" match by category name from the provided list (case-insensitive, only match categories that match the transaction type). Use best guess based on description.
- "tagIds" array of matched tag IDs from the provided list. Tags may be prefixed with # in the message.
- "comments" any extra notes.

Return this JSON shape:
{
  "type": "EXPENSE" | "INCOME",
  "amount": number,
  "description": string | null,
  "date": "today" | "yesterday" | "2daysago" | "3daysago" | "YYYY-MM-DD",
  "accountId": string | null,
  "categoryId": string | null,
  "tagIds": string[],
  "comments": string | null
}`;

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
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  const contextStr = `
Available accounts: ${JSON.stringify(context.accounts)}
Default account ID: ${context.defaultAccountId || 'none'}
Available categories: ${JSON.stringify(context.categories)}
Available tags: ${JSON.stringify(context.tags)}
Current date (ISO): ${new Date().toISOString()}
`;

  const prompt = `${SYSTEM_PROMPT}

${contextStr}

User message: "${message}"`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip any markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  const parsed = JSON.parse(jsonText);

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
